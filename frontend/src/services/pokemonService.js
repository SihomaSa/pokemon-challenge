import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const POKEAPI_DIRECT = 'https://pokeapi.co/api/v2';

// Axios configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * Service for interacting with the Pokémon backend
 */
const pokemonService = {
  /**
   * Get list of Pokémon with pagination
   * @param {number} offset - Starting index
   * @param {number} limit - Number of results
   * @returns {Promise<Object>} - Pokémon list data
   */
  getPokemonList: async (offset = 0, limit = 20) => {
    try {
      const response = await api.get('/pokemon', {
        params: { offset, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Pokémon list:', error.message);
      throw error;
    }
  },

  /**
   * Get details of a specific Pokémon
   * @param {string|number} nameOrId - Name or ID of the Pokémon
   * @returns {Promise<Object>} - Pokémon data
   */
  getPokemonDetails: async (nameOrId) => {
    try {
      const response = await api.get(`/pokemon/${nameOrId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Pokémon ${nameOrId}:`, error.message);
      throw error;
    }
  },

  /**
   * Search Pokémon by name
   * @param {string} query - Search term
   * @returns {Promise<Object>} - Search results
   */
  searchPokemon: async (query) => {
    try {
      if (!query || query.trim().length < 2) {
        return { count: 0, results: [] };
      }
      const response = await api.get(`/search/${query.trim()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching Pokémon:', error.message);
      throw error;
    }
  },

  /**
   * Get a Pokémon by ID directly from PokeAPI
   * (Useful when backend is not available)
   * @param {number} id - Pokémon ID
   * @returns {Promise<Object>} - Pokémon data
   */
  getPokemonById: async (id) => {
    try {
      const response = await axios.get(`${POKEAPI_DIRECT}/pokemon/${id}`, {
        timeout: 10000
      });
      
      const data = response.data;
      return {
        id: data.id,
        name: data.name,
        types: data.types.map(t => t.type.name),
        sprite: data.sprites.front_default,
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map(a => a.ability.name)
      };
    } catch (error) {
      console.error(`Error fetching Pokémon ${id} from PokeAPI:`, error.message);
      throw error;
    }
  },
};

export default pokemonService;