import Redis from 'ioredis';
import { Product } from '../types';

export class CacheService {
  private redis: Redis;
  private readonly CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

  constructor() {
    this.redis = new Redis({
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

  private getCacheKey(query: string): string {
    return `product:${query.toLowerCase().trim()}`;
  }

  async getCachedProduct(query: string): Promise<Product[] | null> {
    try {
      const cachedData = await this.redis.get(this.getCacheKey(query));
      if (!cachedData) {
        return null;
      }
      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error getting cached product:', error);
      return null;
    }
  }

  async setCachedProduct(query: string, products: Product[]): Promise<void> {
    try {
      await this.redis.set(
        this.getCacheKey(query),
        JSON.stringify(products),
        'EX',
        this.CACHE_TTL
      );
    } catch (error) {
      console.error('Error setting cached product:', error);
    }
  }

  async clearCache(query: string): Promise<void> {
    try {
      await this.redis.del(this.getCacheKey(query));
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      const keys = await this.redis.keys('product:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }
} 