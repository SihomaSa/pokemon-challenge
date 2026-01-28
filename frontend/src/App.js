import React, { useState, useEffect, useCallback, useMemo } from 'react';
import pokemonService from './services/pokemonService';
import useFavorites from './hooks/useFavorites';
import PokemonCard from './components/PokemonCard';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import Pagination from './components/Pagination';
import Loading from './components/Loading';
import './App.css';

const ITEMS_PER_PAGE = 20;

function App() {
  // Estados principales
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' o 'favorites'
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    types: [],
    sortBy: 'id-asc',
    minId: '',
    maxId: ''
  });

  // Hook de favoritos
  const {
    favoritesCount,
    isFavorite,
    toggleFavorite,
    getFavoritesList
  } = useFavorites();

  // ============================================
  // CARGA INICIAL DE DATOS
  // ============================================
  
  useEffect(() => {
    if (viewMode === 'all') {
      loadPokemon();
    } else if (viewMode === 'favorites') {
      loadFavorites();
    }
  }, [viewMode]);

  const loadPokemon = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📄 Cargando todos los Pokémon...');
      
      // Cargar los primeros 151 Pokémon para mejor filtrado
      const data = await pokemonService.getPokemonList(0, 151);
      console.log('✅ Pokémon cargados:', data.results?.length);
      
      setPokemonList(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error('❌ Error cargando Pokémon:', err);
      setError('Error al cargar los Pokémon. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = useCallback(async () => {
    console.log('⭐ === CARGANDO FAVORITOS ===');
    console.log('⭐ Cantidad de favoritos:', favoritesCount);
    
    if (favoritesCount === 0) {
      console.log('⚠️ No hay favoritos');
      setPokemonList([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const favoritesList = await getFavoritesList();
      console.log('✅ Favoritos obtenidos:', favoritesList?.length);
      
      if (!favoritesList || !Array.isArray(favoritesList)) {
        console.error('❌ Lista de favoritos inválida');
        setPokemonList([]);
        setTotalCount(0);
        return;
      }
      
      setPokemonList([...favoritesList]);
      setTotalCount(favoritesList.length);
      
    } catch (err) {
      console.error('❌ Error cargando favoritos:', err);
      setError('Error al cargar favoritos.');
      setPokemonList([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [getFavoritesList, favoritesCount]);

  // ============================================
  // FILTRADO Y BÚSQUEDA
  // ============================================

  const filteredPokemon = useMemo(() => {
    console.log('🔍 === APLICANDO FILTROS ===');
    console.log('🔍 Lista original:', pokemonList.length);
    console.log('🔍 Modo de vista:', viewMode);
    
    let filtered = [...pokemonList];

    // Solo aplicar filtros en modo "all"
    if (viewMode === 'all') {
      
      // 1. Filtro de búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        console.log('🔍 Búsqueda:', query);
        filtered = filtered.filter(pokemon => 
          pokemon.name.toLowerCase().includes(query) ||
          pokemon.id.toString().includes(query)
        );
        console.log('🔍 Después de búsqueda:', filtered.length);
      }

      // 2. Filtro de tipos
      if (filters.types.length > 0) {
        console.log('🔍 Tipos seleccionados:', filters.types);
        filtered = filtered.filter(pokemon =>
          filters.types.some(type => pokemon.types.includes(type))
        );
        console.log('🔍 Después de filtro de tipos:', filtered.length);
      }

      // 3. Filtro de rango de ID
      if (filters.minId) {
        const minId = parseInt(filters.minId);
        console.log('🔍 ID mínimo:', minId);
        filtered = filtered.filter(pokemon => pokemon.id >= minId);
        console.log('🔍 Después de filtro minId:', filtered.length);
      }
      
      if (filters.maxId) {
        const maxId = parseInt(filters.maxId);
        console.log('🔍 ID máximo:', maxId);
        filtered = filtered.filter(pokemon => pokemon.id <= maxId);
        console.log('🔍 Después de filtro maxId:', filtered.length);
      }

      // 4. Ordenamiento
      console.log('🔍 Ordenando por:', filters.sortBy);
      switch (filters.sortBy) {
        case 'id-asc':
          filtered.sort((a, b) => a.id - b.id);
          break;
        case 'id-desc':
          filtered.sort((a, b) => b.id - a.id);
          break;
        case 'name-asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          break;
      }
    }

    console.log('✅ Lista filtrada final:', filtered.length);
    return filtered;
  }, [pokemonList, searchQuery, filters, viewMode]);

  // ============================================
  // PAGINACIÓN
  // ============================================

  const paginatedPokemon = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPokemon.slice(startIndex, endIndex);
  }, [filteredPokemon, currentPage]);

  const totalPages = Math.ceil(filteredPokemon.length / ITEMS_PER_PAGE);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSearch = (query) => {
    console.log('🔎 Búsqueda:', query);
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    console.log('🎛️ Cambio de filtros:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    console.log('📄 Cambio de página:', page);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewModeChange = (mode) => {
    console.log('🔄 Cambio de modo:', mode);
    setViewMode(mode);
    setSearchQuery('');
    setCurrentPage(1);
    setError(null);
    setPokemonList([]);
    
    // Limpiar filtros al cambiar de modo
    if (mode === 'favorites') {
      setFilters({
        types: [],
        sortBy: 'id-asc',
        minId: '',
        maxId: ''
      });
    }
  };

  const handleToggleFavorite = async (pokemonId) => {
    console.log('⭐ Toggle favorito:', pokemonId);
    await toggleFavorite(pokemonId);
    
    // Si estamos en vista de favoritos, recargar la lista
    if (viewMode === 'favorites') {
      console.log('⭐ Recargando favoritos...');
      setTimeout(() => {
        loadFavorites();
      }, 100);
    }
  };

  const clearAllFilters = () => {
    console.log('🧹 Limpiando filtros');
    setSearchQuery('');
    setFilters({
      types: [],
      sortBy: 'id-asc',
      minId: '',
      maxId: ''
    });
    setCurrentPage(1);
  };

  // ============================================
  // CONTADORES Y HELPERS
  // ============================================

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.types.length > 0) count++;
    if (filters.minId || filters.maxId) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filters, searchQuery]);

  const hasActiveFilters = activeFilterCount > 0;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-logo">
            <div className="pokeball-icon">
              <div className="pokeball-top"></div>
              <div className="pokeball-center"></div>
              <div className="pokeball-bottom"></div>
            </div>
            <div className="header-text">
              <h1 className="app-title">Pokémon Explorer</h1>
              <p className="app-subtitle">Explora y descubre todos los Pokémon</p>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* SELECTOR DE MODO: Todos / Favoritos */}
        <div className="view-mode-selector">
          <button
            className={`view-mode-button ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('all')}
          >
            Todos los Pokémon
          </button>
          <button
            className={`view-mode-button ${viewMode === 'favorites' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('favorites')}
          >
            ⭐ Favoritos ({favoritesCount})
          </button>
        </div>

        {/* BÚSQUEDA Y FILTROS (solo en modo "all") */}
        {viewMode === 'all' && (
          <>
            <div className="search-section">
              <SearchBar 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Buscar Pokémon por nombre o número..."
              />
              
              <div className="filter-controls">
                <button 
                  className={`filter-toggle ${showFilters ? 'active' : ''}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 5.83333H17.5M5 10H15M7.5 14.1667H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="filter-badge">{activeFilterCount}</span>
                  )}
                </button>

                {activeFilterCount > 0 && (
                  <button className="clear-filters" onClick={clearAllFilters}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Limpiar filtros
                  </button>
                )}

                <div className="results-count">
                  {filteredPokemon.length} resultado{filteredPokemon.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {showFilters && (
              <FilterPanel 
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            )}
          </>
        )}

        {/* MENSAJE: Sin favoritos */}
        {viewMode === 'favorites' && favoritesCount === 0 && !loading && (
          <div className="no-results">
            <div className="no-results-icon">⭐</div>
            <h3>No tienes favoritos aún</h3>
            <p>Haz clic en la estrella de cualquier Pokémon para agregarlo a tus favoritos</p>
            <button
              className="btn-primary"
              onClick={() => handleViewModeChange('all')}
            >
              Ver todos los Pokémon
            </button>
          </div>
        )}

        {/* MENSAJE: Error */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                setError(null);
                if (viewMode === 'favorites') {
                  loadFavorites();
                } else {
                  loadPokemon();
                }
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <Loading message={viewMode === 'favorites' ? 'Cargando favoritos...' : 'Cargando Pokémon...'} />
        ) : (
          <>
            {/* GRID DE POKÉMON */}
            {filteredPokemon.length === 0 && !loading && viewMode === 'all' ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No se encontraron Pokémon</h3>
                <p>Intenta ajustar tus filtros o búsqueda</p>
                {hasActiveFilters && (
                  <button className="btn-primary" onClick={clearAllFilters}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="pokemon-grid">
                  {paginatedPokemon.map((pokemon) => (
                    <PokemonCard 
                      key={pokemon.id} 
                      pokemon={pokemon}
                      isFavorite={isFavorite(pokemon.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>

                {/* PAGINACIÓN */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p className="footer-credits">
          Datos obtenidos de{' '}
          <a
            href="https://pokeapi.co"
            target="_blank"
            rel="noopener noreferrer"
          >
            PokéAPI
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;