export interface Product {
  id: string;
  name: string;
  brand: string;
  url: string;
  imageUrl: string;
  price: string;
  ingredients?: string[];
  ingredientAnalysis?: {
    classification: [string, string][];
    percentages: {
      natural: number;
      synthetic: number;
    };
    environmentalImpact?: {
      analysis: Array<{
        ingredient: string;
        impact: {
          biodegradability: string;
          toxicity: string;
          sustainability: string;
          notes: string;
        };
      }>;
      overallImpact: {
        averageBiodegradability: number;
        averageToxicity: number;
        averageSustainability: number;
        overallScore: number;
      };
    };
  };
}

export interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  cached: boolean;
}

export interface SearchError {
  message: string;
  code: string;
} 