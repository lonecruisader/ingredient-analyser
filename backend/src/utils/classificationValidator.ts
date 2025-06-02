import { Product } from '../types';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  issues: {
    ingredient: string;
    type: 'classification' | 'environmental';
    message: string;
  }[];
}

export class ClassificationValidator {
  private static readonly KNOWN_NATURAL_INGREDIENTS = new Set([
    'water',
    'aloe',
    'coconut',
    'shea',
    'jojoba',
    'argan',
    'olive',
    'sunflower',
    'rose',
    'lavender',
    'chamomile',
    'green tea',
    'vitamin e',
    'vitamin c',
    'hyaluronic acid',
    'squalane',
    'ceramide',
    'collagen',
    'peptide',
    'citric acid'
  ]);

  private static readonly KNOWN_SYNTHETIC_INGREDIENTS = new Set([
    'paraben',
    'sulfate',
    'silicone',
    'petrolatum',
    'mineral oil',
    'propylene glycol',
    'butylene glycol',
    'phenoxyethanol',
    'ethylhexylglycerin',
    'caprylyl glycol',
    'benzyl alcohol',
    'dehydroacetic acid',
    'sorbic acid',
    'benzoic acid',
    'glycerin',
    'lactic acid',
    'glycolic acid',
    'salicylic acid',
    'retinol',
    'niacinamide'
  ]);

  public static validateProduct(product: Product): ValidationResult {
    if (!product.ingredientAnalysis) {
      return {
        isValid: false,
        confidence: 0,
        issues: [{
          ingredient: 'all',
          type: 'classification',
          message: 'No ingredient analysis available'
        }]
      };
    }

    const issues: ValidationResult['issues'] = [];
    let totalConfidence = 0;
    let validClassifications = 0;

    // Dual-source ingredients
    const dualSourceIngredients = new Set([
      'glycerin',
      'hyaluronic acid',
      'vitamin e',
      'vitamin c',
      'retinol',
      'niacinamide'
    ]);

    // Validate each ingredient classification
    for (const [ingredient, classification] of product.ingredientAnalysis.classification) {
      const normalizedIngredient = ingredient.toLowerCase();
      const normalizedClassification = classification.toLowerCase();
      const confidence = this.calculateClassificationConfidence(normalizedIngredient, classification);
      totalConfidence += confidence;
      validClassifications++;

      // Special handling for dual-source ingredients
      if (dualSourceIngredients.has(normalizedIngredient)) {
        if (
          normalizedClassification === 'natural' ||
          normalizedClassification === 'synthetic' ||
          normalizedClassification.includes('both') ||
          normalizedClassification.includes('can be')
        ) {
          // Acceptable, do not flag
        } else {
          issues.push({
            ingredient,
            type: 'classification',
            message: 'Ambiguous ingredient classified with an unexpected value'
          });
        }
      } else {
        // Check for potential misclassifications
        if (classification === 'natural' && this.KNOWN_SYNTHETIC_INGREDIENTS.has(normalizedIngredient)) {
          issues.push({
            ingredient,
            type: 'classification',
            message: 'Known synthetic ingredient classified as natural'
          });
        } else if (classification === 'synthetic' && this.KNOWN_NATURAL_INGREDIENTS.has(normalizedIngredient)) {
          issues.push({
            ingredient,
            type: 'classification',
            message: 'Known natural ingredient classified as synthetic'
          });
        }
      }

      // Validate environmental impact data if available
      if (product.ingredientAnalysis.environmentalImpact) {
        const impactData = product.ingredientAnalysis.environmentalImpact.analysis.find(
          item => item.ingredient.toLowerCase() === normalizedIngredient
        );

        if (!impactData) {
          issues.push({
            ingredient,
            type: 'environmental',
            message: 'Missing environmental impact data'
          });
        } else {
          // Validate impact scores
          const { biodegradability, toxicity, sustainability } = impactData.impact;
          if (!biodegradability || !toxicity || !sustainability) {
            issues.push({
              ingredient,
              type: 'environmental',
              message: 'Incomplete environmental impact data'
            });
          }
        }
      }
    }

    const averageConfidence = validClassifications > 0 ? totalConfidence / validClassifications : 0;
    const isValid = issues.length === 0 && averageConfidence >= 0.8;

    return {
      isValid,
      confidence: averageConfidence,
      issues
    };
  }

  private static calculateClassificationConfidence(ingredient: string, classification: string): number {
    // Base confidence on known ingredient lists
    if (this.KNOWN_NATURAL_INGREDIENTS.has(ingredient) && classification === 'natural') {
      return 1.0;
    }
    if (this.KNOWN_SYNTHETIC_INGREDIENTS.has(ingredient) && classification === 'synthetic') {
      return 1.0;
    }

    // Handle ingredients that can be both natural and synthetic
    const dualSourceIngredients = new Set([
      'glycerin',
      'hyaluronic acid',
      'vitamin e',
      'vitamin c',
      'retinol',
      'niacinamide'
    ]);

    if (dualSourceIngredients.has(ingredient)) {
      if (classification.toLowerCase().includes('both') || 
          classification.toLowerCase().includes('can be')) {
        return 1.0;
      }
      return 0.5; // Lower confidence for binary classification of dual-source ingredients
    }

    // Check for common natural ingredient patterns
    const naturalPatterns = [
      /extract$/,
      /oil$/,
      /butter$/,
      /powder$/,
      /seed$/,
      /fruit$/,
      /flower$/,
      /leaf$/,
      /root$/,
      /bark$/
    ];

    // Check for common synthetic ingredient patterns
    const syntheticPatterns = [
      /-ate$/,
      /-ide$/,
      /-one$/,
      /-ol$/,
      /-ic acid$/,
      /-yl$/,
      /-ene$/,
      /-ium$/,
      /-ate$/,
      /-ide$/
    ];

    // Calculate confidence based on patterns
    let confidence = 0.5; // Default confidence

    if (classification === 'natural') {
      for (const pattern of naturalPatterns) {
        if (pattern.test(ingredient)) {
          confidence += 0.1;
        }
      }
    } else if (classification === 'synthetic') {
      for (const pattern of syntheticPatterns) {
        if (pattern.test(ingredient)) {
          confidence += 0.1;
        }
      }
    }

    return Math.min(confidence, 1.0);
  }
} 