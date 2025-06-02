import axios from 'axios';
import { EnvironmentalImpact, IngredientEnvironmentalAnalysis } from '../utils/environmentalImpact';

export class LLMService {
  private static instance: LLMService;
  private readonly apiKey: string;
  private readonly apiUrl: string;

  private constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  async analyzeIngredients(ingredients: string[]): Promise<[string, string][]> {
    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in analyzing cosmetic ingredients. Classify the following ingredients as natural or synthetic. Return the response as a JSON array of arrays, where each inner array contains the ingredient name and its classification (e.g., [["water", "natural"], ["glycerin", "synthetic"]]).'
          },
          {
            role: 'user',
            content: ingredients.join(', ')
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      try {
        // Parse the response as JSON
        const parsedResponse = JSON.parse(content);
        if (!Array.isArray(parsedResponse)) {
          throw new Error('Response is not an array');
        }
        return parsedResponse;
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        throw new Error('Failed to parse ingredient classification');
      }
    } catch (error) {
      console.error('Error analyzing ingredients:', error);
      throw new Error('Failed to analyze ingredients');
    }
  }

  async analyzeEnvironmentalImpact(ingredients: string[]): Promise<IngredientEnvironmentalAnalysis[]> {
    try {
      const response = await axios.post(this.apiUrl, {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert in analyzing the environmental impact of cosmetic ingredients. For each ingredient, provide an analysis of its:
1. Biodegradability (high/medium/low)
2. Toxicity (low/moderate/high)
3. Sustainability (sustainable/moderate/unsustainable)
4. Brief notes explaining the assessment

Return the response as a JSON array of objects with this structure:
[{
  "ingredient": "ingredient name",
  "impact": {
    "biodegradability": "high|medium|low",
    "toxicity": "low|moderate|high",
    "sustainability": "sustainable|moderate|unsustainable",
    "notes": "brief explanation"
  }
}]`
          },
          {
            role: 'user',
            content: ingredients.join(', ')
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const content = response.data.choices[0].message.content;
      try {
        // Parse the response as JSON
        const parsedResponse = JSON.parse(content);
        if (!Array.isArray(parsedResponse)) {
          throw new Error('Response is not an array');
        }
        return parsedResponse;
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        throw new Error('Failed to parse environmental impact analysis');
      }
    } catch (error) {
      console.error('Error analyzing environmental impact:', error);
      throw new Error('Failed to analyze environmental impact');
    }
  }
} 