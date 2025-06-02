import { Router, Request, Response } from 'express';
import { SephoraScraper } from '../services/scraper';
import { CacheService } from '../services/cache';
import { SearchResponse, SearchError } from '../types';

const router = Router();
const scraper = new SephoraScraper();
const cache = new CacheService();

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

    console.log('Processing search request:', { query, page, pageSize, forceRefresh });

    // Check cache first if not forcing refresh
    if (forceRefresh !== 'true') {
      const cachedProducts = await cache.getCachedProduct(query as string);
      if (cachedProducts) {
        console.log('Returning cached results for query:', query);
        const response: SearchResponse = {
          products: cachedProducts,
          total: cachedProducts.length,
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
          cached: true
        };
        return res.json(response);
      }
    }

    console.log('Cache miss, fetching from Sephora for query:', query);
    const products = await scraper.searchProducts(
      query as string,
      parseInt(page as string),
      parseInt(pageSize as string)
    );

    // Cache the results
    console.log('Caching results for query:', query);
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
    res.status(500).json(searchError);
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

export default router; 