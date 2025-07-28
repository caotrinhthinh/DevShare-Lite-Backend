import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.cache.get(key);
    return data as T | null;
  }

  async set<T>(key: string, value: T, ttl = 600): Promise<void> {
    console.log('🔵 Caching key:', key);
    await this.cache.set<T>(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }
}
