import { LLMService } from '../services/llm';

export interface EnvironmentalImpact {
  biodegradability: 'high' | 'medium' | 'low';
  toxicity: 'low' | 'moderate' | 'high';
  sustainability: 'sustainable' | 'moderate' | 'unsustainable';
  notes: string;
}

export interface IngredientEnvironmentalAnalysis {
  ingredient: string;
  impact: EnvironmentalImpact;
}

export class EnvironmentalImpactAnalyzer {
  private static instance: EnvironmentalImpactAnalyzer;
  private llmService: LLMService;

  private constructor() {
    this.llmService = LLMService.getInstance();
  }

  public static getInstance(): EnvironmentalImpactAnalyzer {
    if (!EnvironmentalImpactAnalyzer.instance) {
      EnvironmentalImpactAnalyzer.instance = new EnvironmentalImpactAnalyzer();
    }
    return EnvironmentalImpactAnalyzer.instance;
  }

  public async analyzeEnvironmentalImpact(ingredients: string[]): Promise<IngredientEnvironmentalAnalysis[]> {
    try {
      const response = await this.llmService.analyzeEnvironmentalImpact(ingredients);
      return response;
    } catch (error) {
      console.error('Error analyzing environmental impact:', error);
      throw new Error('Failed to analyze environmental impact');
    }
  }

  public calculateOverallImpact(analyses: IngredientEnvironmentalAnalysis[]): {
    averageBiodegradability: number;
    averageToxicity: number;
    averageSustainability: number;
    overallScore: number;
  } {
    const impactScores = {
      biodegradability: { high: 3, medium: 2, low: 1 },
      toxicity: { low: 3, moderate: 2, high: 1 },
      sustainability: { sustainable: 3, moderate: 2, unsustainable: 1 }
    };

    const scores = analyses.map(analysis => ({
      biodegradability: impactScores.biodegradability[analysis.impact.biodegradability],
      toxicity: impactScores.toxicity[analysis.impact.toxicity],
      sustainability: impactScores.sustainability[analysis.impact.sustainability]
    }));

    const total = scores.length;
    const averages = {
      averageBiodegradability: scores.reduce((sum, score) => sum + score.biodegradability, 0) / total,
      averageToxicity: scores.reduce((sum, score) => sum + score.toxicity, 0) / total,
      averageSustainability: scores.reduce((sum, score) => sum + score.sustainability, 0) / total
    };

    // Calculate overall score (weighted average)
    const overallScore = (
      averages.averageBiodegradability * 0.4 +
      averages.averageToxicity * 0.3 +
      averages.averageSustainability * 0.3
    );

    return {
      ...averages,
      overallScore
    };
  }
} 