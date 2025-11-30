import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

export const redisConfig: CacheModuleOptions = {
  store: redisStore,
  url: process.env.REDIS_URI,
  ttl: 300, // 5 minutes default TTL
  max: 100, // maximum number of items in cache
};