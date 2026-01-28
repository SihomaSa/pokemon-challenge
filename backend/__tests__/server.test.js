const request = require('supertest');
const app = require('../server');

describe('Pokemon API Endpoints', () => {
  
  // Test de health check
  describe('GET /health', () => {
    it('should return 200 OK with status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // Test de listado de pokémon
  describe('GET /api/pokemon', () => {
    it('should return list of pokemon with default pagination', async () => {
      const response = await request(app)
        .get('/api/pokemon')
        .expect(200);
      
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBeLessThanOrEqual(20);
    });

    it('should return pokemon with correct limit', async () => {
      const limit = 5;
      const response = await request(app)
        .get(`/api/pokemon?limit=${limit}`)
        .expect(200);
      
      expect(response.body.results.length).toBeLessThanOrEqual(limit);
    });

    it('should return pokemon with offset', async () => {
      const response = await request(app)
        .get('/api/pokemon?offset=20&limit=10')
        .expect(200);
      
      expect(response.body.results).toBeDefined();
      expect(response.body.results.length).toBeGreaterThan(0);
    });
  });

  // Test de búsqueda de pokémon
  describe('GET /api/pokemon/:nameOrId', () => {
    it('should return specific pokemon by name', async () => {
      const response = await request(app)
        .get('/api/pokemon/pikachu')
        .expect(200);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'pikachu');
      expect(response.body).toHaveProperty('types');
      expect(Array.isArray(response.body.types)).toBe(true);
    });

    it('should return specific pokemon by ID', async () => {
      const response = await request(app)
        .get('/api/pokemon/25')
        .expect(200);
      
      expect(response.body).toHaveProperty('id', 25);
      expect(response.body).toHaveProperty('name', 'pikachu');
    });

    it('should return 404 for non-existent pokemon', async () => {
      const response = await request(app)
        .get('/api/pokemon/nonexistentpokemon')
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  // Test de búsqueda
  describe('GET /api/search/:query', () => {
    it('should return search results for valid query', async () => {
      const response = await request(app)
        .get('/api/search/pika')
        .expect(200);
      
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('results');
      expect(response.body.results.length).toBeGreaterThan(0);
    });

    it('should return 400 for query less than 2 characters', async () => {
      const response = await request(app)
        .get('/api/search/a')
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  // Test de favoritos
  describe('Favorites Endpoints', () => {
    const testPokemonId = 25; // Pikachu

    it('POST /api/favorites should add pokemon to favorites', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .send({ pokemonId: testPokemonId })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('pokemonId', testPokemonId);
    });

    it('GET /api/favorites should return list of favorites', async () => {
      const response = await request(app)
        .get('/api/favorites')
        .expect(200);
      
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('GET /api/favorites/check/:pokemonId should verify favorite status', async () => {
      const response = await request(app)
        .get(`/api/favorites/check/${testPokemonId}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('pokemonId', testPokemonId);
      expect(response.body).toHaveProperty('isFavorite');
      expect(typeof response.body.isFavorite).toBe('boolean');
    });

    it('POST /api/favorites/toggle should toggle favorite', async () => {
      const response = await request(app)
        .post('/api/favorites/toggle')
        .send({ pokemonId: testPokemonId })
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('isFavorite');
    });

    it('DELETE /api/favorites/:pokemonId should remove favorite', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${testPokemonId}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('pokemonId', testPokemonId);
    });

    it('POST /api/favorites should return 400 for invalid pokemonId', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .send({ pokemonId: 'invalid' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  // Test de caché
  describe('GET /api/cache/stats', () => {
    it('should return cache statistics', async () => {
      const response = await request(app)
        .get('/api/cache/stats')
        .expect(200);
      
      expect(response.body).toHaveProperty('keys');
      expect(response.body).toHaveProperty('hits');
      expect(response.body).toHaveProperty('misses');
      expect(response.body).toHaveProperty('hitRate');
    });
  });

  // Test de rutas no encontradas
  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});
