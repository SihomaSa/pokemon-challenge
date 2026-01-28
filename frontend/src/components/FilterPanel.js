import React from 'react';
import './FilterPanel.css';

const POKEMON_TYPES = [
  { name: 'normal', color: '#A8A878' },
  { name: 'fire', color: '#F08030' },
  { name: 'water', color: '#6890F0' },
  { name: 'electric', color: '#F8D030' },
  { name: 'grass', color: '#78C850' },
  { name: 'ice', color: '#98D8D8' },
  { name: 'fighting', color: '#C03028' },
  { name: 'poison', color: '#A040A0' },
  { name: 'ground', color: '#E0C068' },
  { name: 'flying', color: '#A890F0' },
  { name: 'psychic', color: '#F85888' },
  { name: 'bug', color: '#A8B820' },
  { name: 'rock', color: '#B8A038' },
  { name: 'ghost', color: '#705898' },
  { name: 'dragon', color: '#7038F8' },
  { name: 'dark', color: '#705848' },
  { name: 'steel', color: '#B8B8D0' },
  { name: 'fairy', color: '#EE99AC' }
];

const FilterPanel = ({ filters, onFilterChange }) => {
  const handleTypeToggle = (typeName) => {
    const newTypes = filters.types.includes(typeName)
      ? filters.types.filter(t => t !== typeName)
      : [...filters.types, typeName];
    
    onFilterChange({ ...filters, types: newTypes });
  };

  const handleSortChange = (e) => {
    onFilterChange({ ...filters, sortBy: e.target.value });
  };

  const handleIdRangeChange = (field, value) => {
    const numValue = value === '' ? '' : parseInt(value) || '';
    onFilterChange({ ...filters, [field]: numValue });
  };

  return (
    <div className="filter-panel">
      <div className="filter-section">
        <h3 className="filter-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 2L2 8L8 14M12 2L18 8L12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tipo de Pokémon
        </h3>
        <div className="type-grid">
          {POKEMON_TYPES.map((type) => (
            <button
              key={type.name}
              className={`type-button ${filters.types.includes(type.name) ? 'active' : ''}`}
              style={{
                '--type-color': type.color,
                '--type-color-dark': adjustColor(type.color, -20)
              }}
              onClick={() => handleTypeToggle(type.name)}
            >
              <span className="type-icon" style={{ backgroundColor: type.color }}>
                {getTypeIcon(type.name)}
              </span>
              <span className="type-name">{type.name}</span>
              {filters.types.includes(type.name) && (
                <svg className="type-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 4H17M3 10H17M3 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Ordenar por
        </h3>
        <select 
          className="sort-select"
          value={filters.sortBy}
          onChange={handleSortChange}
        >
          <option value="id-asc">Número: Menor a mayor</option>
          <option value="id-desc">Número: Mayor a menor</option>
          <option value="name-asc">Nombre: A-Z</option>
          <option value="name-desc">Nombre: Z-A</option>
        </select>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 10H18M2 10C2 14.4183 5.58172 18 10 18M2 10C2 5.58172 5.58172 2 10 2M18 10C18 14.4183 14.4183 18 10 18M18 10C18 5.58172 14.4183 2 10 2M10 2V18" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Rango de Número
        </h3>
        <div className="range-inputs">
          <div className="range-input-group">
            <label htmlFor="minId">Desde</label>
            <input
              id="minId"
              type="number"
              className="range-input"
              placeholder="1"
              min="1"
              max="151"
              value={filters.minId}
              onChange={(e) => handleIdRangeChange('minId', e.target.value)}
            />
          </div>
          <div className="range-separator">—</div>
          <div className="range-input-group">
            <label htmlFor="maxId">Hasta</label>
            <input
              id="maxId"
              type="number"
              className="range-input"
              placeholder="151"
              min="1"
              max="151"
              value={filters.maxId}
              onChange={(e) => handleIdRangeChange('maxId', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to darken colors
function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Helper function to get type icons
function getTypeIcon(type) {
  const icons = {
    normal: '⭐',
    fire: '🔥',
    water: '💧',
    electric: '⚡',
    grass: '🌿',
    ice: '❄️',
    fighting: '👊',
    poison: '☠️',
    ground: '🌍',
    flying: '🦅',
    psychic: '🔮',
    bug: '🐛',
    rock: '🪨',
    ghost: '👻',
    dragon: '🐉',
    dark: '🌙',
    steel: '⚙️',
    fairy: '✨'
  };
  return icons[type] || '❓';
}

export default FilterPanel;