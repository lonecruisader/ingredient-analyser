const { SephoraScraper } = require("../backend/dist/services/scraper");
const { CacheService } = require("../backend/dist/services/cache");
const { LLMService } = require("../backend/dist/services/llm");
const {
	calculatePercentages,
} = require("../backend/dist/utils/percentageCalculator");

const scraper = new SephoraScraper();
const cache = new CacheService();
const llmService = LLMService.getInstance();

module.exports = async (req, res) => {
	// Enable CORS
	res.setHeader("Access-Control-Allow-Credentials", true);
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
	);

	// Handle OPTIONS request
	if (req.method === "OPTIONS") {
		res.status(200).end();
		return;
	}

	try {
		const {
			query,
			page = "1",
			pageSize = "20",
			forceRefresh = "false",
		} = req.query;

		if (!query) {
			return res.status(400).json({
				message: "Search query is required",
				code: "MISSING_QUERY",
			});
		}

		// Check cache first if not forcing refresh
		if (forceRefresh !== "true") {
			try {
				const cachedProducts = await cache.getCachedProduct(query);
				if (cachedProducts) {
					return res.json({
						products: cachedProducts,
						total: cachedProducts.length,
						page: parseInt(page),
						pageSize: parseInt(pageSize),
						cached: true,
					});
				}
			} catch (cacheError) {
				console.error(
					"Error retrieving or processing cached data:",
					cacheError
				);
				// Continue to fetch from Sephora if cache fails
			}
		}

		const products = await scraper.searchProducts(
			query,
			parseInt(page),
			parseInt(pageSize)
		);

		// Perform ingredient analysis on products with ingredients
		for (const product of products) {
			if (product.ingredients && product.ingredients.length > 0) {
				try {
					// Analyze ingredient classification
					const classification = await llmService.analyzeIngredients(
						product.ingredients
					);
					const percentages = calculatePercentages(classification);

					// Add analysis to product
					product.ingredientAnalysis = {
						classification,
						percentages,
					};
				} catch (error) {
					console.error(
						"Error analyzing ingredients for product:",
						product.id,
						error
					);
					// Continue with other products if one fails
				}
			}
		}

		// Cache the results
		await cache.setCachedProduct(query, products);

		res.json({
			products,
			total: products.length,
			page: parseInt(page),
			pageSize: parseInt(pageSize),
			cached: false,
		});
	} catch (error) {
		console.error("Search route error:", error);
		res.status(500).json({
			message:
				error instanceof Error ? error.message : "Failed to search products",
			code: "SEARCH_ERROR",
		});
	}
};
