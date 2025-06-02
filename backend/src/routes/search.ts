import { Router, Request, Response } from 'express';
import { SephoraScraper } from '../services/scraper';
import { CacheService } from '../services/cache';
import { SearchResponse, SearchError } from '../types';
import { LLMService } from '../services/llm';
import { calculatePercentages } from '../utils/percentageCalculator';
import { EnvironmentalImpactAnalyzer } from '../utils/environmentalImpact';
import { IngredientFormatter } from '../utils/ingredientFormatter';
import { ClassificationValidator } from '../utils/classificationValidator';

const router = Router();
const scraper = new SephoraScraper();
const cache = new CacheService();
const llmService = LLMService.getInstance();

// Test Redis connection
router.get('/cache/test', async (req: Request, res: Response) => {
  try {
    const testKey = 'test:connection';
    await cache.setCachedProduct(testKey, []);
    const result = await cache.getCachedProduct(testKey);
    await cache.clearCache(testKey);
    
    res.json({
      status: 'success',
      message: 'Redis connection is working',
      testResult: result !== null
    });
  } catch (error) {
    console.error('Redis test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Redis connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/products', async (req: Request, res: Response) => {
  try {
    const { query, page = '1', pageSize = '20', forceRefresh = 'false' } = req.query;

    if (!query) {
      const error: SearchError = {
        message: 'Search query is required',
        code: 'MISSING_QUERY'
      };
      return res.status(400).json(error);
    }

    // Check cache first if not forcing refresh
    if (forceRefresh !== 'true') {
      try {
        const cachedProducts = await cache.getCachedProduct(query as string);
        if (cachedProducts) {
          const response: SearchResponse = {
            products: cachedProducts,
            total: cachedProducts.length,
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            cached: true
          };
          return res.json(response);
        }
      } catch (cacheError) {
        console.error('Error retrieving or processing cached data:', cacheError);
        // Continue to fetch from Sephora if cache fails
      }
    }

    const products = await scraper.searchProducts(
      query as string,
      parseInt(page as string),
      parseInt(pageSize as string)
    );

    // Perform ingredient analysis on products with ingredients
    for (const product of products) {
      if (product.ingredients && product.ingredients.length > 0) {
        try {
          // Analyze ingredient classification
          const classification = await llmService.analyzeIngredients(product.ingredients);
          const percentages = calculatePercentages(classification);

          // Add analysis to product
          product.ingredientAnalysis = {
            classification,
            percentages
          };
        } catch (error) {
          console.error('Error analyzing ingredients for product:', product.id, error);
          // Continue with other products if one fails
        }
      }
    }

    // Cache the results
    await cache.setCachedProduct(query as string, products);

    const response: SearchResponse = {
      products,
      total: products.length,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      cached: false
    };

    res.json(response);
  } catch (error) {
    console.error('Search route error:', error);
    const searchError: SearchError = {
      message: error instanceof Error ? error.message : 'Failed to search products',
      code: 'SEARCH_ERROR'
    };
    // Check if response headers have already been sent
    if (!res.headersSent) {
      res.status(500).json(searchError);
    }
  }
});

// Add cache management endpoints
router.post('/cache/clear', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (query) {
      await cache.clearCache(query);
      res.json({ message: 'Cache cleared for query', query });
    } else {
      await cache.clearAllCache();
      res.json({ message: 'All cache cleared' });
    }
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      message: 'Failed to clear cache',
      code: 'CACHE_CLEAR_ERROR'
    });
  }
});

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ message: 'Ingredients array is required' });
    }

    const llmService = LLMService.getInstance();
    const environmentalAnalyzer = EnvironmentalImpactAnalyzer.getInstance();

    // Analyze ingredient classification
    const classification = await llmService.analyzeIngredients(ingredients);
    const percentages = calculatePercentages(classification);

    // Analyze environmental impact
    const environmentalAnalysis = await environmentalAnalyzer.analyzeEnvironmentalImpact(ingredients);
    const overallImpact = environmentalAnalyzer.calculateOverallImpact(environmentalAnalysis);

    // Create a temporary product object for validation
    const tempProduct = {
      id: 'temp',
      name: 'Temporary Product',
      brand: 'Temporary Brand',
      url: '',
      imageUrl: '',
      price: 0,
      ingredients,
      ingredientAnalysis: {
        classification,
        percentages,
        environmentalImpact: {
          analysis: environmentalAnalysis,
          overallImpact
        }
      }
    };

    // Format the analysis
    const formattedAnalysis = IngredientFormatter.formatProductAnalysis(tempProduct);

    // Validate the classification
    const validationResult = ClassificationValidator.validateProduct(tempProduct);

    res.json({
      classification,
      percentages,
      environmentalImpact: {
        analysis: environmentalAnalysis,
        overallImpact
      },
      formattedAnalysis,
      validationResult
    });
  } catch (error) {
    console.error('Ingredient analysis error:', error);
    res.status(500).json({
      message: 'Failed to analyze ingredients',
      code: 'ANALYSIS_ERROR'
    });
  }
});

export default router; 