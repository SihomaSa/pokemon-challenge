import React from 'react';
import './PokemonCard.css';

/**
 * Componente para mostrar información de un pokémon individual
 */
const PokemonCard = ({ pokemon, onClick, isFavorite, onToggleFavorite }) => {
  const { id, name, types, sprite } = pokemon;

  // Colores por tipo de pokémon
  const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
  };

  const getTypeColor = (type) => typeColors[type] || '#68A090';

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // Evitar que se active el onClick del card
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  return (
    <div 
      className="pokemon-card" 
      onClick={() => onClick && onClick(pokemon)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="pokemon-card-header">
        <span className="pokemon-id">#{String(id).padStart(3, '0')}</span>
        {onToggleFavorite && (
          <button
            className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        )}
      </div>
      
      <div className="pokemon-image-container">
        {sprite ? (
          <img 
            src={sprite} 
            alt={name}
            className="pokemon-image"
            loading="lazy"
          />
        ) : (
          <div className="pokemon-image-placeholder">?</div>
        )}
      </div>
      
      <div className="pokemon-info">
        <h3 className="pokemon-name">
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </h3>
        
        <div className="pokemon-types">
          {types.map((type) => (
            <span 
              key={type}
              className="pokemon-type"
              style={{ backgroundColor: getTypeColor(type) }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;