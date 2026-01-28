import React from 'react';
import './Pagination.css';

/**
 * Enhanced Pagination Component
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="pagination">
      <button
        className="pagination-button pagination-prev"
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Anterior</span>
      </button>
      
      <div className="pagination-pages">
        {currentPage > 3 && (
          <>
            <button
              className="pagination-number"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {currentPage > 4 && <span className="pagination-ellipsis">...</span>}
          </>
        )}
        
        {getPageNumbers().map((page) => (
          <button
            key={page}
            className={`pagination-number ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        
        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && <span className="pagination-ellipsis">...</span>}
            <button
              className="pagination-number"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      
      <button
        className="pagination-button pagination-next"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <span>Siguiente</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default Pagination;