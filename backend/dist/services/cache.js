"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
class CacheService {
    constructor() {
        this.CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });
        this.redis.on('error', (error) => {
            console.error('Redis connection error:', error);
        });
        this.redis.on('connect', () => {
            console.log('Successfully connected to Redis');
        });
    }
    getCacheKey(query) {
        return `product:${query.toLowerCase().trim()}`;
    }
    async getCachedProduct(query) {
        try {
            console.log('Checking cache for query:', query);
            const cachedData = await this.redis.get(this.getCacheKey(query));
            if (!cachedData) {
                console.log('Cache miss for query:', query);
                return null;
            }
            console.log('Cache hit for query:', query);
            return JSON.parse(cachedData);
        }
        catch (error) {
            console.error('Error getting cached product:', error);
            return null;
        }
    }
    async setCachedProduct(query, products) {
        try {
            console.log('Setting cache for query:', query);
            await this.redis.set(this.getCacheKey(query), JSON.stringify(products), 'EX', this.CACHE_TTL);
            console.log('Successfully cached data for query:', query);
        }
        catch (error) {
            console.error('Error setting cached product:', error);
        }
    }
    async clearCache(query) {
        try {
            console.log('Clearing cache for query:', query);
            await this.redis.del(this.getCacheKey(query));
            console.log('Successfully cleared cache for query:', query);
        }
        catch (error) {
            console.error('Error clearing cache:', error);
        }
    }
    async clearAllCache() {
        try {
            console.log('Clearing all cache');
            const keys = await this.redis.keys('product:*');
            if (keys.length > 0) {
                await this.redis.del(...keys);
                console.log('Successfully cleared all cache');
            }
            else {
                console.log('No cache entries to clear');
            }
        }
        catch (error) {
            console.error('Error clearing all cache:', error);
        }
    }
}
exports.CacheService = CacheService;
