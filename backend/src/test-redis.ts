import { CacheService } from './services/cache';
import { Product } from './types';

async function testRedisConnection() {
  console.log('Testing Redis connection...');
  console.log('Environment variables:');
  console.log('REDIS_URL:', process.env.REDIS_URL);
  console.log('REDIS_HOST:', process.env.REDIS_HOST);
  console.log('REDIS_PORT:', process.env.REDIS_PORT);
  console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '****' : 'not set');

  const cache = new CacheService();

  try {
    // Test setting a value
    console.log('\nTesting set operation...');
    const testProduct: Product = {
      id: '1',
      name: 'Test Product',
      brand: 'Test Brand',
      url: 'https://example.com',
      imageUrl: 'https://example.com/image.jpg',
      price: 9.99
    };
    await cache.setCachedProduct('test-key', [testProduct]);
    console.log('Set operation successful');

    // Test getting the value
    console.log('\nTesting get operation...');
    const result = await cache.getCachedProduct('test-key');
    console.log('Get operation result:', result);

    // Test clearing the value
    console.log('\nTesting clear operation...');
    await cache.clearCache('test-key');
    console.log('Clear operation successful');

    console.log('\nAll Redis operations completed successfully!');
  } catch (error) {
    console.error('\nRedis test failed:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the test
testRedisConnection(); 