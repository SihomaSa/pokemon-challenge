const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const favoritesManager = require('./favorites');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de caché (TTL: 1 hora)
const cache = new NodeCache({ stdTTL: 3600 });

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de la API externa
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Helper function para obtener datos de la PokeAPI con caché
 */
async function fetchFromPokeAPI(endpoint) {
  const cacheKey = endpoint;
  
  // Verificar si existe en caché
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for: ${endpoint}`);
    return cachedData;
  }
  
  // Si no está en caché, hacer petición
  try {
    console.log(`Fetching from API: ${endpoint}`);
    const response = await axios.get(`${POKEAPI_BASE_URL}${endpoint}`);
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching from PokeAPI: ${error.message}`);
  }
}

/**
 * GET /api/pokemon
 * Obtiene lista de pokémon con paginación
 * Query params: offset, limit
 */
app.get('/api/pokemon', async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 20;
    
    const data = await fetchFromPokeAPI(`/pokemon?offset=${offset}&limit=${limit}`);
    
    // Obtener detalles de cada pokémon (incluyendo sprites)
    const pokemonWithDetails = await Promise.all(
      data.results.map(async (pokemon) => {
        try {
          const details = await fetchFromPokeAPI(`/pokemon/${pokemon.name}`);
          return {
            id: details.id,
            name: details.name,
            types: details.types.map(t => t.type.name),
            sprite: details.sprites.front_default,
            height: details.height,
            weight: details.weight,
            abilities: details.abilities.map(a => a.ability.name)
          };
        } catch (error) {
          console.error(`Error fetching details for ${pokemon.name}:`, error.message);
          return null;
        }
      })
    );
    
    res.json({
      count: data.count,
      next: data.next,
      previous: data.previous,
      results: pokemonWithDetails.filter(p => p !== null)
    });
  } catch (error) {
    console.error('Error in /api/pokemon:', error.message);
    res.status(500).json({ error: 'Error fetching Pokémon list' });
  }
});

/**
 * GET /api/pokemon/:nameOrId
 * Obtiene detalles de un pokémon específico
 */
app.get('/api/pokemon/:nameOrId', async (req, res) => {
  try {
    const { nameOrId } = req.params;
    const data = await fetchFromPokeAPI(`/pokemon/${nameOrId.toLowerCase()}`);
    
    const pokemonDetails = {
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      sprites: {
        front_default: data.sprites.front_default,
        front_shiny: data.sprites.front_shiny,
        back_default: data.sprites.back_default,
        back_shiny: data.sprites.back_shiny
      },
      height: data.height,
      weight: data.weight,
      abilities: data.abilities.map(a => ({
        name: a.ability.name,
        is_hidden: a.is_hidden
      })),
      stats: data.stats.map(s => ({
        name: s.stat.name,
        base_stat: s.base_stat
      })),
      base_experience: data.base_experience
    };
    
    res.json(pokemonDetails);
  } catch (error) {
    console.error(`Error in /api/pokemon/${req.params.nameOrId}:`, error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'Pokémon not found' });
    } else {
      res.status(500).json({ error: 'Error fetching Pokémon details' });
    }
  }
});

/**
 * GET /api/search/:query
 * Búsqueda de pokémon por nombre
 */
app.get('/api/search/:query', async (req, res) => {
  try {
    const query = req.query.q || req.params.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }
    
    // Obtener lista completa (usamos un límite alto para búsqueda)
    const cacheKey = 'all-pokemon-names';
    let allPokemon = cache.get(cacheKey);
    
    if (!allPokemon) {
      const data = await fetchFromPokeAPI('/pokemon?limit=1500');
      allPokemon = data.results;
      cache.set(cacheKey, allPokemon, 7200); // Cache por 2 horas
    }
    
    // Filtrar por nombre
    const filtered = allPokemon.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // Limitar resultados de búsqueda
    const limitedResults = filtered.slice(0, 20);
    
    // Obtener detalles de los resultados
    const resultsWithDetails = await Promise.all(
      limitedResults.map(async (pokemon) => {
        try {
          const details = await fetchFromPokeAPI(`/pokemon/${pokemon.name}`);
          return {
            id: details.id,
            name: details.name,
            types: details.types.map(t => t.type.name),
            sprite: details.sprites.front_default
          };
        } catch (error) {
          return null;
        }
      })
    );
    
    res.json({
      count: filtered.length,
      results: resultsWithDetails.filter(p => p !== null)
    });
  } catch (error) {
    console.error('Error in /api/search:', error.message);
    res.status(500).json({ error: 'Error searching Pokémon' });
  }
});

// ============================================
// FAVORITOS ENDPOINTS
// ============================================

/**
 * GET /api/favorites
 * Obtiene la lista de pokémon favoritos del usuario
 */
app.get('/api/favorites', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const favoriteIds = favoritesManager.getFavorites(userId);
    
    // Obtener detalles de cada pokémon favorito
    const favoritesWithDetails = await Promise.all(
      favoriteIds.map(async (id) => {
        try {
          const details = await fetchFromPokeAPI(`/pokemon/${id}`);
          return {
            id: details.id,
            name: details.name,
            types: details.types.map(t => t.type.name),
            sprite: details.sprites.front_default,
            height: details.height,
            weight: details.weight
          };
        } catch (error) {
          console.error(`Error fetching favorite pokemon ${id}:`, error.message);
          return null;
        }
      })
    );
    
    res.json({
      count: favoriteIds.length,
      results: favoritesWithDetails.filter(p => p !== null)
    });
  } catch (error) {
    console.error('Error in /api/favorites:', error.message);
    res.status(500).json({ error: 'Error fetching favorites' });
  }
});

/**
 * POST /api/favorites
 * Agregar pokémon a favoritos
 * Body: { pokemonId: number, userId?: string }
 */
app.post('/api/favorites', (req, res) => {
  try {
    const { pokemonId, userId = 'default' } = req.body;
    
    if (!pokemonId || typeof pokemonId !== 'number') {
      return res.status(400).json({ error: 'Valid pokemonId is required' });
    }
    
    const result = favoritesManager.addFavorite(userId, pokemonId);
    res.json(result);
  } catch (error) {
    console.error('Error in POST /api/favorites:', error.message);
    res.status(500).json({ error: 'Error adding favorite' });
  }
});

/**
 * DELETE /api/favorites/:pokemonId
 * Eliminar pokémon de favoritos
 * Query params: userId (opcional)
 */
app.delete('/api/favorites/:pokemonId', (req, res) => {
  try {
    const pokemonId = parseInt(req.params.pokemonId);
    const userId = req.query.userId || 'default';
    
    if (!pokemonId || isNaN(pokemonId)) {
      return res.status(400).json({ error: 'Valid pokemonId is required' });
    }
    
    const result = favoritesManager.removeFavorite(userId, pokemonId);
    res.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/favorites:', error.message);
    res.status(500).json({ error: 'Error removing favorite' });
  }
});

/**
 * POST /api/favorites/toggle
 * Toggle favorito (agregar/eliminar)
 * Body: { pokemonId: number, userId?: string }
 */
app.post('/api/favorites/toggle', (req, res) => {
  try {
    const { pokemonId, userId = 'default' } = req.body;
    
    if (!pokemonId || typeof pokemonId !== 'number') {
      return res.status(400).json({ error: 'Valid pokemonId is required' });
    }
    
    const result = favoritesManager.toggleFavorite(userId, pokemonId);
    res.json({
      ...result,
      isFavorite: favoritesManager.isFavorite(userId, pokemonId)
    });
  } catch (error) {
    console.error('Error in POST /api/favorites/toggle:', error.message);
    res.status(500).json({ error: 'Error toggling favorite' });
  }
});

/**
 * GET /api/favorites/check/:pokemonId
 * Verificar si un pokémon está en favoritos
 */
app.get('/api/favorites/check/:pokemonId', (req, res) => {
  try {
    const pokemonId = parseInt(req.params.pokemonId);
    const userId = req.query.userId || 'default';
    
    if (!pokemonId || isNaN(pokemonId)) {
      return res.status(400).json({ error: 'Valid pokemonId is required' });
    }
    
    const isFavorite = favoritesManager.isFavorite(userId, pokemonId);
    res.json({ pokemonId, isFavorite });
  } catch (error) {
    console.error('Error in GET /api/favorites/check:', error.message);
    res.status(500).json({ error: 'Error checking favorite status' });
  }
});

// ============================================
// OTROS ENDPOINTS
// ============================================

/**
 * GET /api/cache/stats
 * Obtiene estadísticas del caché (útil para debugging)
 */
app.get('/api/cache/stats', (req, res) => {
  const stats = cache.getStats();
  res.json({
    keys: cache.keys().length,
    hits: stats.hits,
    misses: stats.misses,
    hitRate: stats.hits / (stats.hits + stats.misses) || 0
  });
});

/**
 * DELETE /api/cache
 * Limpia el caché (útil para desarrollo)
 */
app.delete('/api/cache', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared successfully' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;