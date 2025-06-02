import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading = false, error = null }) => {
  const [query, setQuery] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!query.trim()) {
      setLocalError('Please enter a product name to search');
      return;
    }
    
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="search-container">
      <div className="search-wrapper">
        <input
          type="text"
          className={`search-input ${error || localError ? 'search-input-error' : ''}`}
          placeholder="Search for a Sephora product..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLocalError(null);
          }}
          aria-label="Search products"
          disabled={isLoading}
        />
        <button 
          type="submit"
          className={`search-button ${isLoading ? 'search-button-loading' : ''}`}
          aria-label="Search"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="search-spinner" />
          ) : (
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      {(error || localError) && (
        <div className="search-error" role="alert">
          {error || localError}
        </div>
      )}
    </form>
  );
};

export default SearchBar; 