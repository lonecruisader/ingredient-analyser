"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SephoraScraper = exports.ScraperError = void 0;
const axios_1 = __importStar(require("axios"));
const cheerio = __importStar(require("cheerio"));
class ScraperError extends Error {
    constructor(message, code, statusCode, originalError) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.name = 'ScraperError';
    }
}
exports.ScraperError = ScraperError;
class SephoraScraper {
    constructor() {
        this.baseUrl = 'https://www.sephora.com';
        this.searchApiUrl = 'https://www.sephora.com/api/v2/catalog/search';
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // Minimum 1 second between requests
    }
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        this.lastRequestTime = Date.now();
    }
    async searchProducts(query, pageNum = 1, pageSize = 20) {
        try {
            await this.waitForRateLimit();
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
            const response = await axios_1.default.get(`${this.searchApiUrl}/?${searchParams.toString()}`);
            const products = [];
            if (!response.data?.products) {
                throw new ScraperError('No products found in search results', 'NO_PRODUCTS_FOUND', 404);
            }
            // Get the first product from the search results
            const firstProduct = response.data.products[0];
            if (!firstProduct) {
                throw new ScraperError('No products found for the given search query', 'NO_PRODUCTS_FOUND', 404);
            }
            try {
                // Get detailed product information from the product URL
                const detailedProduct = await this.getProductDetails(`${this.baseUrl}${firstProduct.targetUrl}`);
                products.push(detailedProduct);
            }
            catch (error) {
                console.error('Error getting product details:', error);
                // Fallback to basic product info if detailed fetch fails
                if (!firstProduct.id || !firstProduct.name) {
                    throw new ScraperError('Invalid product data in search results', 'INVALID_PRODUCT_DATA', 500, error instanceof Error ? error : undefined);
                }
                products.push({
                    id: firstProduct.id,
                    name: firstProduct.name,
                    brand: firstProduct.brand || '',
                    url: firstProduct.targetUrl || '',
                    imageUrl: firstProduct.imageUrl || '',
                    price: parseFloat(firstProduct.price?.replace('$', '') || '0'),
                    ingredients: firstProduct.ingredients || []
                });
            }
            return products;
        }
        catch (error) {
            if (error instanceof ScraperError) {
                throw error;
            }
            if (error instanceof axios_1.AxiosError) {
                if (error.response?.status === 404) {
                    throw new ScraperError('Product not found', 'PRODUCT_NOT_FOUND', 404, error);
                }
                if (error.response?.status === 429) {
                    throw new ScraperError('Too many requests. Please try again later', 'RATE_LIMIT_EXCEEDED', 429, error);
                }
                if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                    throw new ScraperError('Failed to connect to Sephora. Please try again later', 'CONNECTION_ERROR', 503, error);
                }
            }
            throw new ScraperError('Failed to search products', 'SEARCH_ERROR', 500, error instanceof Error ? error : undefined);
        }
    }
    async getProductDetails(productUrl) {
        try {
            await this.waitForRateLimit();
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            };
            const response = await axios_1.default.get(productUrl, { headers });
            const $ = cheerio.load(response.data);
            const pageJsonScript = $('script#linkStore[type="text/json"][data-comp="PageJSON "]').html();
            if (!pageJsonScript) {
                throw new ScraperError('Product data not found in page', 'PRODUCT_DATA_NOT_FOUND', 404);
            }
            let pageData;
            try {
                pageData = JSON.parse(pageJsonScript);
            }
            catch (error) {
                throw new ScraperError('Invalid product data format', 'INVALID_PRODUCT_DATA', 500, error instanceof Error ? error : undefined);
            }
            const productData = pageData?.page?.product?.currentSku;
            if (!productData) {
                throw new ScraperError('Product data not found in parsed JSON', 'PRODUCT_DATA_NOT_FOUND', 404);
            }
            if (!productData.skuId || !productData.productName) {
                throw new ScraperError('Invalid product data structure', 'INVALID_PRODUCT_DATA', 500);
            }
            // Parse ingredients from the ingredient description
            const ingredients = this.parseIngredients(productData.ingredientDesc);
            return {
                id: productData.skuId,
                name: productData.productName,
                brand: productData.brandName || '',
                url: productUrl,
                imageUrl: productData.skuImages?.imageUrl || '',
                price: productData.listPrice || 0,
                ingredients
            };
        }
        catch (error) {
            if (error instanceof ScraperError) {
                throw error;
            }
            if (error instanceof axios_1.AxiosError) {
                if (error.response?.status === 404) {
                    throw new ScraperError('Product not found', 'PRODUCT_NOT_FOUND', 404, error);
                }
                if (error.response?.status === 429) {
                    throw new ScraperError('Too many requests. Please try again later', 'RATE_LIMIT_EXCEEDED', 429, error);
                }
            }
            throw new ScraperError('Failed to get product details', 'PRODUCT_DETAILS_ERROR', 500, error instanceof Error ? error : undefined);
        }
    }
    parseIngredients(ingredientDesc) {
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
exports.SephoraScraper = SephoraScraper;
