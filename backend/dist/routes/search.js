"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scraper_1 = require("../services/scraper");
const cache_1 = require("../services/cache");
const llm_1 = require("../services/llm");
const percentageCalculator_1 = require("../utils/percentageCalculator");
const environmentalImpact_1 = require("../utils/environmentalImpact");
const ingredientFormatter_1 = require("../utils/ingredientFormatter");
const classificationValidator_1 = require("../utils/classificationValidator");
const router = (0, express_1.Router)();
const scraper = new scraper_1.SephoraScraper();
const cache = new cache_1.CacheService();
// Test Redis connection
router.get('/cache/test', async (req, res) => {
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
    }
    catch (error) {
        console.error('Redis test error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Redis connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/products', async (req, res) => {
    try {
        console.log('Backend /products received request. Query params:', req.query);
        const { query, page = '1', pageSize = '20', forceRefresh = 'false' } = req.query;
        if (!query) {
            const error = {
                message: 'Search query is required',
                code: 'MISSING_QUERY'
            };
            return res.status(400).json(error);
        }
        console.log('Processing search request:', { query, page, pageSize, forceRefresh });
        // Check cache first if not forcing refresh
        if (forceRefresh !== 'true') {
            const cachedProducts = await cache.getCachedProduct(query);
            if (cachedProducts) {
                console.log('Returning cached results for query:', query);
                const response = {
                    products: cachedProducts,
                    total: cachedProducts.length,
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    cached: true
                };
                return res.json(response);
            }
        }
        console.log('Cache miss, fetching from Sephora for query:', query);
        const products = await scraper.searchProducts(query, parseInt(page), parseInt(pageSize));
        // Cache the results
        console.log('Caching results for query:', query);
        await cache.setCachedProduct(query, products);
        const response = {
            products,
            total: products.length,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            cached: false
        };
        res.json(response);
    }
    catch (error) {
        console.error('Search route error:', error);
        const searchError = {
            message: error instanceof Error ? error.message : 'Failed to search products',
            code: 'SEARCH_ERROR'
        };
        res.status(500).json(searchError);
    }
});
// Add cache management endpoints
router.post('/cache/clear', async (req, res) => {
    try {
        const { query } = req.body;
        if (query) {
            await cache.clearCache(query);
            res.json({ message: 'Cache cleared for query', query });
        }
        else {
            await cache.clearAllCache();
            res.json({ message: 'All cache cleared' });
        }
    }
    catch (error) {
        console.error('Cache clear error:', error);
        res.status(500).json({
            message: 'Failed to clear cache',
            code: 'CACHE_CLEAR_ERROR'
        });
    }
});
router.post('/analyze', async (req, res) => {
    try {
        const { ingredients } = req.body;
        if (!ingredients || !Array.isArray(ingredients)) {
            return res.status(400).json({ message: 'Ingredients array is required' });
        }
        const llmService = llm_1.LLMService.getInstance();
        const environmentalAnalyzer = environmentalImpact_1.EnvironmentalImpactAnalyzer.getInstance();
        // Analyze ingredient classification
        const classification = await llmService.analyzeIngredients(ingredients);
        const percentages = (0, percentageCalculator_1.calculatePercentages)(classification);
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
        const formattedAnalysis = ingredientFormatter_1.IngredientFormatter.formatProductAnalysis(tempProduct);
        // Validate the classification
        const validationResult = classificationValidator_1.ClassificationValidator.validateProduct(tempProduct);
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
    }
    catch (error) {
        console.error('Ingredient analysis error:', error);
        res.status(500).json({
            message: 'Failed to analyze ingredients',
            code: 'ANALYSIS_ERROR'
        });
    }
});
exports.default = router;
