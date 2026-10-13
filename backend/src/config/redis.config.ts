import { CacheModuleOptions } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

export const redisConfig = (): any => ({
  stores: [
    new KeyvRedis(process.env.REDIS_URI || 'redis://localhost:6379', {
      ttl: 3600, // 1 hour default TTL (milliseconds for keyv)
    }),
  ],
});
