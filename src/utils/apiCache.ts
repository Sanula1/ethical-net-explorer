
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in minutes
  forceRefresh?: boolean;
}

class ApiCacheManager {
  private static instance: ApiCacheManager;
  private readonly DEFAULT_TTL = 30; // 30 minutes default cache
  private readonly CACHE_PREFIX = 'api_cache_';

  static getInstance(): ApiCacheManager {
    if (!ApiCacheManager.instance) {
      ApiCacheManager.instance = new ApiCacheManager();
    }
    return ApiCacheManager.instance;
  }

  private generateCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${this.CACHE_PREFIX}${endpoint}_${paramString}`;
  }

  private isExpired(entry: CacheEntry, ttlMinutes: number): boolean {
    const now = Date.now();
    const expirationTime = entry.timestamp + (ttlMinutes * 60 * 1000);
    return now > expirationTime;
  }

  setCache<T>(endpoint: string, data: T, params?: Record<string, any>, ttlMinutes?: number): void {
    try {
      const cacheKey = this.generateCacheKey(endpoint, params);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        key: cacheKey
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(entry));
      console.log(`Cache set for ${endpoint}:`, { cacheKey, dataLength: Array.isArray(data) ? data.length : 1 });
    } catch (error) {
      console.warn('Failed to set cache:', error);
    }
  }

  getCache<T>(endpoint: string, params?: Record<string, any>, options: CacheOptions = {}): T | null {
    try {
      const { ttl = this.DEFAULT_TTL, forceRefresh = false } = options;
      
      if (forceRefresh) {
        console.log(`Force refresh requested for ${endpoint}`);
        return null;
      }

      const cacheKey = this.generateCacheKey(endpoint, params);
      const cachedItem = localStorage.getItem(cacheKey);
      
      if (!cachedItem) {
        console.log(`No cache found for ${endpoint}`);
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cachedItem);
      
      if (this.isExpired(entry, ttl)) {
        console.log(`Cache expired for ${endpoint}`);
        this.clearCache(endpoint, params);
        return null;
      }

      console.log(`Cache hit for ${endpoint}:`, { cacheKey, dataLength: Array.isArray(entry.data) ? entry.data.length : 1 });
      return entry.data;
    } catch (error) {
      console.warn('Failed to get cache:', error);
      return null;
    }
  }

  clearCache(endpoint: string, params?: Record<string, any>): void {
    try {
      const cacheKey = this.generateCacheKey(endpoint, params);
      localStorage.removeItem(cacheKey);
      console.log(`Cache cleared for ${endpoint}`);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  clearUserCache(userId: string): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX) && key.includes(`/users/${userId}/`)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} cache entries for user ${userId}`);
    } catch (error) {
      console.warn('Failed to clear user cache:', error);
    }
  }

  clearAllCache(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared all ${keysToRemove.length} cache entries`);
    } catch (error) {
      console.warn('Failed to clear all cache:', error);
    }
  }

  getCacheStats(): { totalEntries: number; totalSize: number } {
    let totalEntries = 0;
    let totalSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_PREFIX)) {
          totalEntries++;
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += item.length;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
    }

    return { totalEntries, totalSize };
  }
}

export const apiCache = ApiCacheManager.getInstance();
