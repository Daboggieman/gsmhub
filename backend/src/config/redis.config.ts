import { CacheModuleOptions } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

export const redisConfig = () => ({
  stores: [
    new KeyvRedis(process.env.REDIS_URI || 'redis://localhost:6379'),
  ],
  ttl: 3600 * 1000, // keyv expects milliseconds; 1 hour default TTL
});
