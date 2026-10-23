import { CacheModuleOptions } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

/**
 * Redis-backed cache for the API.
 *
 * The cache must never take the API down: when Redis is unreachable
 * (not installed locally, restarted, network blip) cache operations should
 * degrade to cache misses instead of 500-ing whole endpoints.
 *
 * createKeyv() returns a Keyv instance wrapping the Redis adapter with
 * throwOnConnectError/throwOnErrors disabled, so failed cache operations
 * no-op and return a miss. The adapter still emits 'error' events, and
 * Keyv re-emits them — with no listener Keyv throws, so we attach a
 * logging listener here. The DevicesService cache helpers additionally
 * wrap reads/writes in try/catch as a second layer.
 */
export const redisConfig = (): CacheModuleOptions => {
  const keyv = createKeyv(process.env.REDIS_URI || 'redis://localhost:6379', {
    throwOnConnectError: false,
    throwOnErrors: false,
  });
  // Swallow cache-layer errors — a dead Redis must never break an API request.
  keyv.on('error', (err) => {
    console.warn(`[cache] Redis unavailable: ${(err as Error).message}`);
  });
  return {
    stores: [keyv],
    ttl: 3600 * 1000, // keyv expects milliseconds; 1 hour default TTL
  };
};
