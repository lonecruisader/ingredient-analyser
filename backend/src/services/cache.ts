import Redis from 'ioredis';
import { Product } from '../types';

export class CacheService {
  private redis: Redis;
  private readonly CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds
  private isConnected: boolean = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required');
    }

    // Only add TLS if using rediss://
    const options: any = {
      connectTimeout: 10000, // 10 seconds
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null;
        }
        const delay = Math.min(times * 1000, 3000);
        console.log(`Retrying Redis connection in ${delay}ms...`);
        return delay;
      },
      enableOfflineQueue: true, // Enable offline queue to handle connection issues
      enableReadyCheck: true,
      reconnectOnError: (err: Error) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true; // Reconnect when the error is READONLY
        }
        return false;
      },
      lazyConnect: true, // Don't connect immediately
      keepAlive: 10000, // Keep alive every 10 seconds
      family: 0, // Allow both IPv4 and IPv6
      db: 0
    };

    if (redisUrl.startsWith('rediss://')) {
      options.tls = { rejectUnauthorized: false };
    }

    this.redis = new Redis(redisUrl, options);

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
      this.isConnected = false;
    });

    this.redis.on('connect', () => {
      console.log('Successfully connected to Redis');
      this.isConnected = true;
    });

    this.redis.on('ready', () => {
      console.log('Redis client is ready');
      this.isConnected = true;
    });

    this.redis.on('end', () => {
      console.log('Redis connection ended');
      this.isConnected = false;
    });

    this.redis.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });

    // Connect explicitly after setting up event handlers
    this.redis.connect().catch((error) => {
      console.error('Failed to connect to Redis:', error);
    });
  }

  private async ensureConnection(): Promise<boolean> {
    if (!this.isConnected) {
      try {
        // Try to reconnect if not connected
        if (!this.redis.status || this.redis.status === 'end') {
          await this.redis.connect();
        }
        await this.redis.ping();
        this.isConnected = true;
        return true;
      } catch (error) {
        console.error('Failed to ensure Redis connection:', error);
        return false;
      }
    }
    return true;
  }

  private getCacheKey(query: string): string {
    return `product:${query.toLowerCase().trim()}`;
  }

  async getCachedProduct(query: string): Promise<Product[] | null> {
    try {
      if (!await this.ensureConnection()) {
        console.log('Skipping cache due to connection issues');
        return null;
      }

      const cachedData = await this.redis.get(this.getCacheKey(query));
      if (!cachedData) {
        return null;
      }
      return JSON.parse(cachedData);
    } catch (error) {
      console.error('Error getting cached product:', error);
      this.isConnected = false;
      return null;
    }
  }

  async setCachedProduct(query: string, products: Product[]): Promise<void> {
    try {
      if (!await this.ensureConnection()) {
        console.log('Skipping cache set due to connection issues');
        return;
      }

      await this.redis.set(
        this.getCacheKey(query),
        JSON.stringify(products),
        'EX',
        this.CACHE_TTL
      );
    } catch (error) {
      console.error('Error setting cached product:', error);
      this.isConnected = false;
    }
  }

  async clearCache(query: string): Promise<void> {
    try {
      if (!await this.ensureConnection()) {
        console.log('Skipping cache clear due to connection issues');
        return;
      }

      await this.redis.del(this.getCacheKey(query));
    } catch (error) {
      console.error('Error clearing cache:', error);
      this.isConnected = false;
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      if (!await this.ensureConnection()) {
        console.log('Skipping cache clear all due to connection issues');
        return;
      }

      const keys = await this.redis.keys('product:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Error clearing all cache:', error);
      this.isConnected = false;
    }
  }
} 