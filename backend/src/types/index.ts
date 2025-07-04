import { IngredientEnvironmentalAnalysis } from '../utils/environmentalImpact';
import { FormattedAnalysis } from '../utils/ingredientFormatter';
import { ValidationResult } from '../utils/classificationValidator';

export interface Product {
  id: string;
  name: string;
  brand: string;
  url: string;
  imageUrl: string;
  price: number;
  ingredients?: string[];
  ingredientAnalysis?: {
    classification: [string, string][];
    percentages: {
      natural: number;
      synthetic: number;
    };
    environmentalImpact?: {
      analysis: IngredientEnvironmentalAnalysis[];
      overallImpact: {
        averageBiodegradability: number;
        averageToxicity: number;
        averageSustainability: number;
        overallScore: number;
      };
    };
  };
  formattedAnalysis?: FormattedAnalysis;
  validationResult?: ValidationResult;
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