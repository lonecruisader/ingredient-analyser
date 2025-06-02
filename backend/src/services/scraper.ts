import axios from 'axios';
import * as cheerio from 'cheerio';
import { Product } from '../types';

export class SephoraScraper {
  private readonly baseUrl = 'https://www.sephora.com';
  private readonly searchApiUrl = 'https://www.sephora.com/api/v2/catalog/search';

  async searchProducts(query: string, pageNum: number = 1, pageSize: number = 20): Promise<Product[]> {
    try {
      const searchParams = new URLSearchParams({
        type: 'keyword',
        q: query,
        includeEDD: 'true',
        content: 'true',
        includeRegionsMap: 'true',
        page: pageSize.toString(),
        currentPage: pageNum.toString(),
        loc: 'en-US',
        ch: 'rwd',
        countryCode: 'US'
      });

      const response = await axios.get(`${this.searchApiUrl}/?${searchParams.toString()}`);
      const products: Product[] = [];

      if (response.data?.products) {
        // Get the first product from the search results
        const firstProduct = response.data.products[0];
        if (firstProduct) {
          try {
            // Get detailed product information from the product URL
            const detailedProduct = await this.getProductDetails(`${this.baseUrl}${firstProduct.targetUrl}`);
            products.push(detailedProduct);
          } catch (error) {
            console.error('Error getting product details:', error);
            // Fallback to basic product info if detailed fetch fails
            products.push({
              id: firstProduct.id || '',
              name: firstProduct.name || '',
              brand: firstProduct.brand || '',
              url: firstProduct.targetUrl || '',
              imageUrl: firstProduct.imageUrl || '',
              price: parseFloat(firstProduct.price?.replace('$', '') || '0'),
              ingredients: firstProduct.ingredients || []
            });
          }
        }
      }

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  async getProductDetails(productUrl: string): Promise<Product> {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };

      const response = await axios.get(productUrl, { headers });
      const $ = cheerio.load(response.data);
      
      const pageJsonScript = $('script#linkStore[type="text/json"][data-comp="PageJSON "]').html();
      
      if (!pageJsonScript) {
        throw new Error('Product data not found in linkStore script');
      }

      const pageData = JSON.parse(pageJsonScript);
      
      const productData = pageData?.page.product.currentSku;
      if (!productData) {
        throw new Error('Product data not found in parsed JSON');
      }

      // Parse ingredients from the ingredient description
      const ingredients = this.parseIngredients(productData.ingredientDesc);

      return {
        id: productData.skuId || '',
        name: productData.productName || '',
        brand: productData.brandName || '',
        url: productUrl,
        imageUrl: productData.skuImages.imageUrl || '',
        price: productData.listPrice || 0,
        ingredients
      };
    } catch (error) {
      console.error('Error getting product details:', error);
      throw new Error('Failed to get product details');
    }
  }

  private parseIngredients(ingredientDesc: string | undefined): string[] {
    if (!ingredientDesc) {
      return [];
    }

    // First, remove HTML tags and decode HTML entities
    const cleanDesc = ingredientDesc
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");

    // Split ingredients by common delimiters and clean up
    const ingredients = cleanDesc
      .split(/[,;]/) // Split by comma or semicolon
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0) // Remove empty strings
      .map(ingredient => {
        // Remove common prefixes and clean up
        return ingredient
          .replace(/^[*•]/g, '') // Remove bullet points
          .replace(/^[A-Za-z]+\.\s*/g, '') // Remove numbered prefixes (e.g., "1. ")
          .replace(/^\s*['"]|['"]\s*$/g, '') // Remove quotes at start/end
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
      })
      .filter(ingredient => ingredient.length > 0); // Final filter for any empty strings

    return ingredients;
  }
} 