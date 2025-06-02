import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import IngredientAnalysis from './components/IngredientAnalysis';
import { api } from './services/api';
import { Product } from './types';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Product | null>(null);

  // Add error logging
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setError('An unexpected error occurred. Please try again.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setSearchResults(null); // Clear previous results
    try {
      const products = await api.searchProducts(query);
      
      if (products && products.length > 0) {
        setSearchResults(products[0]);
      } else {
        setError('No products found');
      }
    } catch (err) {
      console.error('Frontend: Search error:', err);
      // Check if the error is our custom ApiError for connection issues
      if (err instanceof Error && err.message.includes('Failed to connect to the backend')) {
         setError(err.message);
      } else {
        setError('Failed to search products. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sephora Ingredient Analyzer</h1>
        <p className="subtitle">Discover the environmental impact of your beauty products</p>
      </header>

      <main className="app-main">
        <div className="content-container">
          <SearchBar 
            onSearch={handleSearch} 
            isLoading={isLoading}
            error={error}
          />
          
          {isLoading && (
            <div 
              className="loading-container" 
              role="status" 
              aria-live="polite"
            >
              <div className="loading-spinner" aria-hidden="true"></div>
              <p>Analyzing product ingredients...</p>
            </div>
          )}

          {error && !isLoading && (
            <div 
              className="error-container" 
              role="alert" 
              aria-live="assertive"
            >
              <span className="error-icon" aria-hidden="true">⚠️</span>
              <p className="error-message">{error}</p>
            </div>
          )}

          {!isLoading && !error && searchResults && (
            <IngredientAnalysis product={searchResults} />
          )}

          {!isLoading && !error && !searchResults && (
            <div 
              className="placeholder-content" 
              role="status" 
              aria-live="polite"
            >
              <span className="placeholder-icon" aria-hidden="true">🔍</span>
              <p>Enter a Sephora product name to analyze its ingredients</p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2024 Sephora Ingredient Analyzer | Making beauty sustainable</p>
      </footer>
    </div>
  );
};

export default App; 