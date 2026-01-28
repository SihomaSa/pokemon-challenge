import React, { useRef, useEffect } from 'react';
import './SearchBar.css';

/**
 * Enhanced Search Bar Component
 */
const SearchBar = ({ value, onChange, placeholder = "Buscar Pokémon..." }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Focus search when "/" is pressed
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Clear search when "Escape" is pressed
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onChange('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onChange]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar">
      <svg 
        className="search-icon" 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      
      {value && (
        <button 
          className="search-clear"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      <div className="search-shortcut">
        <kbd>/</kbd>
      </div>
    </div>
  );
};

export default SearchBar;