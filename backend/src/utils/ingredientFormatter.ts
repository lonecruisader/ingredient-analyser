import { Product } from '../types';
import { IngredientEnvironmentalAnalysis } from './environmentalImpact';

export interface FormattedIngredient {
  name: string;
  type: 'natural' | 'synthetic';
  environmentalImpact?: {
    biodegradability: 'high' | 'medium' | 'low';
    toxicity: 'low' | 'moderate' | 'high';
    sustainability: 'sustainable' | 'moderate' | 'unsustainable';
    notes: string;
  };
}

export interface FormattedAnalysis {
  ingredients: FormattedIngredient[];
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
}

export class IngredientFormatter {
  public static formatProductAnalysis(product: Product): FormattedAnalysis {
    if (!product.ingredientAnalysis) {
      throw new Error('Product has no ingredient analysis');
    }

    const { classification, percentages, environmentalImpact } = product.ingredientAnalysis;

    // Create a map of ingredient names to their environmental impact
    const impactMap = new Map<string, IngredientEnvironmentalAnalysis['impact']>();
    if (environmentalImpact) {
      environmentalImpact.analysis.forEach(item => {
        impactMap.set(item.ingredient, item.impact);
      });
    }

    // Format individual ingredients
    const formattedIngredients: FormattedIngredient[] = classification.map(([name, type]) => ({
      name,
      type: type as 'natural' | 'synthetic',
      environmentalImpact: impactMap.get(name)
    }));

    // Group ingredients by type
    const naturalIngredients = formattedIngredients.filter(i => i.type === 'natural');
    const syntheticIngredients = formattedIngredients.filter(i => i.type === 'synthetic');

    // Identify high and low impact ingredients
    const highImpactIngredients: string[] = [];
    const lowImpactIngredients: string[] = [];

    if (environmentalImpact) {
      environmentalImpact.analysis.forEach(item => {
        const score = this.calculateIngredientScore(item.impact);
        if (score >= 2.5) {
          highImpactIngredients.push(item.ingredient);
        } else if (score <= 1.5) {
          lowImpactIngredients.push(item.ingredient);
        }
      });
    }

    return {
      ingredients: formattedIngredients,
      summary: {
        natural: {
          count: naturalIngredients.length,
          percentage: percentages.natural,
          ingredients: naturalIngredients.map(i => i.name)
        },
        synthetic: {
          count: syntheticIngredients.length,
          percentage: percentages.synthetic,
          ingredients: syntheticIngredients.map(i => i.name)
        },
        environmental: {
          averageBiodegradability: environmentalImpact?.overallImpact.averageBiodegradability || 0,
          averageToxicity: environmentalImpact?.overallImpact.averageToxicity || 0,
          averageSustainability: environmentalImpact?.overallImpact.averageSustainability || 0,
          overallScore: environmentalImpact?.overallImpact.overallScore || 0,
          highImpactIngredients,
          lowImpactIngredients
        }
      }
    };
  }

  private static calculateIngredientScore(impact: IngredientEnvironmentalAnalysis['impact']): number {
    const scores = {
      biodegradability: { high: 3, medium: 2, low: 1 },
      toxicity: { low: 3, moderate: 2, high: 1 },
      sustainability: { sustainable: 3, moderate: 2, unsustainable: 1 }
    };

    return (
      scores.biodegradability[impact.biodegradability] * 0.4 +
      scores.toxicity[impact.toxicity] * 0.3 +
      scores.sustainability[impact.sustainability] * 0.3
    );
  }
} 