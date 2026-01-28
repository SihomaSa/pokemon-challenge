import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const POKEAPI_DIRECT = 'https://pokeapi.co/api/v2';

/**
 * Custom hook para manejar favoritos
 * VERSIÓN FINAL - GARANTIZA QUE LOS DATOS SE RENDERICEN
 */
function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('pokemon-favorites');
      const parsed = stored ? JSON.parse(stored) : [];
      console.log('🔍 Favoritos iniciales:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Error cargando favoritos:', error);
      return [];
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  useEffect(() => {
    localStorage.setItem('pokemon-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const checkBackend = useCallback(async () => {
    try {
      await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, { timeout: 2000 });
      setBackendAvailable(true);
      return true;
    } catch (error) {
      setBackendAvailable(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  const isFavorite = useCallback((pokemonId) => {
    return favorites.includes(pokemonId);
  }, [favorites]);

  const addFavorite = useCallback(async (pokemonId) => {
    console.log('➕ Agregando favorito:', pokemonId);
    try {
      setLoading(true);
      
      setFavorites(prev => {
        const newFavs = [...new Set([...prev, pokemonId])];
        console.log('✅ Nuevos favoritos:', newFavs);
        return newFavs;
      });
      
      if (backendAvailable) {
        try {
          await axios.post(`${API_BASE_URL}/favorites`, { pokemonId }, { timeout: 3000 });
        } catch (error) {
          console.warn('⚠️ Backend no disponible');
          setBackendAvailable(false);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error adding favorite:', error);
      setFavorites(prev => prev.filter(id => id !== pokemonId));
      return false;
    } finally {
      setLoading(false);
    }
  }, [backendAvailable]);

  const removeFavorite = useCallback(async (pokemonId) => {
    console.log('➖ Eliminando favorito:', pokemonId);
    try {
      setLoading(true);
      
      setFavorites(prev => {
        const newFavs = prev.filter(id => id !== pokemonId);
        console.log('✅ Favoritos después de eliminar:', newFavs);
        return newFavs;
      });
      
      if (backendAvailable) {
        try {
          await axios.delete(`${API_BASE_URL}/favorites/${pokemonId}`, { timeout: 3000 });
        } catch (error) {
          setBackendAvailable(false);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      setFavorites(prev => [...new Set([...prev, pokemonId])]);
      return false;
    } finally {
      setLoading(false);
    }
  }, [backendAvailable]);

  const toggleFavorite = useCallback(async (pokemonId) => {
    if (isFavorite(pokemonId)) {
      return await removeFavorite(pokemonId);
    } else {
      return await addFavorite(pokemonId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  /**
   * VERSIÓN FINAL - Obtener lista de favoritos
   * GARANTIZA que retorna un array válido
   */
  const getFavoritesList = useCallback(async () => {
    console.log('📋 === INICIO getFavoritesList ===');
    console.log('📋 Favoritos IDs:', favorites);
    
    if (!favorites || favorites.length === 0) {
      console.log('⚠️ No hay favoritos, retornando array vacío');
      return [];
    }
    
    setLoading(true);
    
    try {
      console.log(`🔄 Fetching ${favorites.length} favoritos desde PokeAPI...`);
      
      // Crear array de promesas
      const pokemonPromises = favorites.map(id => {
        console.log(`  📥 Iniciando fetch para ID: ${id}`);
        return axios.get(`${POKEAPI_DIRECT}/pokemon/${id}`, { timeout: 10000 })
          .then(response => {
            const data = response.data;
            const pokemon = {
              id: data.id,
              name: data.name,
              types: data.types.map(t => t.type.name),
              sprite: data.sprites.front_default,
              height: data.height,
              weight: data.weight,
              abilities: data.abilities.map(a => a.ability.name)
            };
            console.log(`  ✅ Pokemon ${id} (${pokemon.name}) OK`);
            return pokemon;
          })
          .catch(error => {
            console.error(`  ❌ Error en pokemon ${id}:`, error.message);
            return null;
          });
      });
      
      // Esperar todas las promesas
      const results = await Promise.all(pokemonPromises);
      console.log('📊 Resultados raw:', results);
      
      // Filtrar nulos
      const validResults = results.filter(p => p !== null);
      console.log(`✅ ${validResults.length} favoritos válidos de ${favorites.length} totales`);
      console.log('📊 Lista final a retornar:', validResults);
      
      return validResults;
      
    } catch (error) {
      console.error('❌ Error CRÍTICO en getFavoritesList:', error);
      return [];
    } finally {
      setLoading(false);
      console.log('📋 === FIN getFavoritesList ===');
    }
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem('pokemon-favorites');
  }, []);

  return {
    favorites,
    favoritesCount: favorites.length,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getFavoritesList,
    clearFavorites,
    loading,
    backendAvailable
  };
}

export default useFavorites;