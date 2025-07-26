
import { apiClient } from './client';
import { apiCache } from '@/utils/apiCache';

interface CachedRequestOptions {
  forceRefresh?: boolean;
  ttl?: number; // Time to live in minutes
  skipCache?: boolean;
}

class CachedApiClient {
  private async checkCacheAvailability(): Promise<boolean> {
    try {
      const stats = await apiCache.getCacheStats();
      return stats.storageType !== 'memory' || true; // Even memory cache is better than no cache
    } catch {
      return false;
    }
  }

  async get<T>(
    endpoint: string, 
    params?: Record<string, any>, 
    options: CachedRequestOptions = {}
  ): Promise<T> {
    const { forceRefresh = false, ttl = 30, skipCache = false } = options;
    
    console.log(`Cache request for ${endpoint}:`, { params, forceRefresh, skipCache, ttl });
    
    // Skip cache for certain endpoints or when explicitly requested
    if (skipCache) {
      console.log(`Skipping cache for ${endpoint}`);
      return apiClient.get<T>(endpoint, params);
    }

    // Check if caching is available
    const cacheAvailable = await this.checkCacheAvailability();
    if (!cacheAvailable) {
      console.log(`Cache not available, making direct API call for ${endpoint}`);
      return apiClient.get<T>(endpoint, params);
    }

    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = await apiCache.getCache<T>(endpoint, params, { ttl });
        if (cachedData !== null) {
          console.log(`Cache HIT for ${endpoint} - returning cached data`);
          return cachedData;
        }
        console.log(`Cache MISS for ${endpoint} - making API call`);
      } else {
        console.log(`Force refresh requested for ${endpoint} - skipping cache check`);
      }

      // Make API call and cache the result
      console.log(`Making API call for ${endpoint}:`, params);
      const data = await apiClient.get<T>(endpoint, params);
      
      // Cache the response
      await apiCache.setCache(endpoint, data, params, ttl);
      console.log(`Data cached for ${endpoint} with TTL ${ttl} minutes`);
      
      return data;
    } catch (cacheError) {
      console.warn('Cache operation failed, making direct API call:', cacheError);
      return apiClient.get<T>(endpoint, params);
    }
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    const result = await apiClient.post<T>(endpoint, body);
    
    // Clear related cache entries when posting new data
    await this.clearRelatedCache(endpoint);
    
    return result;
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    const result = await apiClient.put<T>(endpoint, body);
    
    // Clear related cache entries when updating data
    await this.clearRelatedCache(endpoint);
    
    return result;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const result = await apiClient.delete<T>(endpoint);
    
    // Clear related cache entries when deleting data
    await this.clearRelatedCache(endpoint);
    
    return result;
  }

  private async clearRelatedCache(endpoint: string): Promise<void> {
    try {
      // Clear cache for list endpoints when individual items are modified
      const patterns = [
        '/institutes',
        '/classes',
        '/subjects',
        '/homework',
        '/lectures',
        '/users'
      ];

      for (const pattern of patterns) {
        if (endpoint.includes(pattern)) {
          // Clear all cache entries that might be affected
          await apiCache.clearUserCache('*'); // This could be improved to be more specific
          break;
        }
      }
    } catch (error) {
      console.warn('Failed to clear related cache:', error);
    }
  }

  // Method to force refresh data
  async refresh<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.get<T>(endpoint, params, { forceRefresh: true });
  }

  // Method to check if data exists in cache WITHOUT making API call
  async hasCache(endpoint: string, params?: Record<string, any>): Promise<boolean> {
    try {
      const cachedData = await apiCache.getCache(endpoint, params, { forceRefresh: false });
      const hasData = cachedData !== null;
      console.log(`Cache check for ${endpoint}:`, { hasData, params });
      return hasData;
    } catch {
      return false;
    }
  }

  // Method to get cached data WITHOUT making API call if not found
  async getCachedOnly<T>(endpoint: string, params?: Record<string, any>): Promise<T | null> {
    try {
      const cachedData = await apiCache.getCache<T>(endpoint, params, { forceRefresh: false });
      if (cachedData !== null) {
        console.log(`Cached data found for ${endpoint}`);
        return cachedData;
      }
      console.log(`No cached data for ${endpoint}`);
      return null;
    } catch (error) {
      console.warn('Error getting cached data:', error);
      return null;
    }
  }

  // Method to get cache statistics
  async getCacheStats() {
    return apiCache.getCacheStats();
  }
}

export const cachedApiClient = new CachedApiClient();
