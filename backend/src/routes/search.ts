import { Router, Request, Response } from 'express';
import { SephoraScraper } from '../services/scraper';
import { SearchResponse, SearchError } from '../types';

const router = Router();
const scraper = new SephoraScraper();

router.get('/products', async (req: Request, res: Response) => {
  try {
    const { query, page = '1', pageSize = '20' } = req.query;

    if (!query) {
      const error: SearchError = {
        message: 'Search query is required',
        code: 'MISSING_QUERY'
      };
      return res.status(400).json(error);
    }

    console.log(`Received search request for query: ${query}, page: ${page}, pageSize: ${pageSize}`);

    const products = await scraper.searchProducts(
      query as string,
      parseInt(page as string),
      parseInt(pageSize as string)
    );

    console.log(`Found ${products.length} products for query: ${query}`);

    const response: SearchResponse = {
      products,
      total: products.length,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
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

export default router; 