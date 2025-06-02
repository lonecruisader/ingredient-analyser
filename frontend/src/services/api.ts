import { Product, SearchResponse, SearchError } from '../types';

const API_BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/products?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        const error = data as SearchError;
        throw new ApiError(error.message, error.code, response.status);
      }

      const searchResponse = data as SearchResponse;
      // The backend /products route should return an array of products,
      // each potentially containing ingredientAnalysis.
      // We need to ensure the types match what the backend actually returns.
      // Assuming the backend returns Product[] where each Product might have ingredientAnalysis
      return searchResponse.products;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // More specific error handling for fetch errors like ERR_CONNECTION_REFUSED
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
         throw new ApiError(
          'Failed to connect to the backend. Please ensure the backend server is running.',
          'CONNECTION_REFUSED',
          0 // No HTTP status code for network errors
        );
      }
      throw new ApiError(
        'An unexpected error occurred while searching products',
        'UNKNOWN_SEARCH_ERROR',
        500 // Generic server error status
      );
    }
  },

  async analyzeIngredients(ingredients: string[]): Promise<{
    classification: [string, string][];
    percentages: {
      natural: number;
      synthetic: number;
    };
    environmentalImpact: {
      analysis: Array<{
        ingredient: string;
        impact: {
          biodegradability: number;
          toxicity: number;
          sustainability: number;
        };
      }>;
      overallImpact: {
        averageBiodegradability: number;
        averageToxicity: number;
        averageSustainability: number;
        overallScore: number;
      };
    };
    formattedAnalysis: {
      ingredients: Array<{
        name: string;
        type: 'natural' | 'synthetic' | 'mixed';
        environmentalImpact: 'low' | 'medium' | 'high';
        description: string;
      }>;
      summary: {
        natural: {
          count: number;
          percentage: number;
          ingredients: string[];
        };
        synthetic: {
          count: number;
          percentage: number;
          ingredients: string[];
        };
        environmental: {
          averageBiodegradability: number;
          averageToxicity: number;
          averageSustainability: number;
          overallScore: number;
          highImpactIngredients: string[];
          lowImpactIngredients: string[];
        };
      };
    };
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Failed to analyze ingredients',
          data.code || 'ANALYSIS_ERROR',
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Failed to analyze ingredients',
        'ANALYSIS_ERROR',
        500
      );
    }
  }
}; 