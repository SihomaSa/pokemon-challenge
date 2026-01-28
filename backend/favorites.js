// favorites.js - Sistema de favoritos (simulado con almacenamiento local)
// En producción, esto estaría en una base de datos

class FavoritesManager {
  constructor() {
    // Simulamos una "base de datos" en memoria
    // En producción: PostgreSQL, MongoDB, etc.
    this.favorites = new Map();
  }

  /**
   * Obtener favoritos de un usuario
   * @param {string} userId - ID del usuario
   */
  getFavorites(userId = 'default') {
    if (!this.favorites.has(userId)) {
      return [];
    }
    return Array.from(this.favorites.get(userId));
  }

  /**
   * Agregar pokémon a favoritos
   * @param {string} userId - ID del usuario
   * @param {number} pokemonId - ID del pokémon
   */
  addFavorite(userId = 'default', pokemonId) {
    if (!this.favorites.has(userId)) {
      this.favorites.set(userId, new Set());
    }
    
    const userFavorites = this.favorites.get(userId);
    userFavorites.add(pokemonId);
    
    return {
      success: true,
      pokemonId,
      totalFavorites: userFavorites.size
    };
  }

  /**
   * Eliminar pokémon de favoritos
   * @param {string} userId - ID del usuario
   * @param {number} pokemonId - ID del pokémon
   */
  removeFavorite(userId = 'default', pokemonId) {
    if (!this.favorites.has(userId)) {
      return {
        success: false,
        message: 'No favorites found'
      };
    }
    
    const userFavorites = this.favorites.get(userId);
    const deleted = userFavorites.delete(pokemonId);
    
    return {
      success: deleted,
      pokemonId,
      totalFavorites: userFavorites.size
    };
  }

  /**
   * Verificar si un pokémon está en favoritos
   * @param {string} userId - ID del usuario
   * @param {number} pokemonId - ID del pokémon
   */
  isFavorite(userId = 'default', pokemonId) {
    if (!this.favorites.has(userId)) {
      return false;
    }
    return this.favorites.get(userId).has(pokemonId);
  }

  /**
   * Toggle favorito (agregar si no existe, eliminar si existe)
   * @param {string} userId - ID del usuario
   * @param {number} pokemonId - ID del pokémon
   */
  toggleFavorite(userId = 'default', pokemonId) {
    if (this.isFavorite(userId, pokemonId)) {
      return this.removeFavorite(userId, pokemonId);
    } else {
      return this.addFavorite(userId, pokemonId);
    }
  }
}

module.exports = new FavoritesManager();