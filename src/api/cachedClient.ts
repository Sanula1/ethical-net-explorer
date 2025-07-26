
import { apiClient, ApiResponse } from './client';
import { apiCache } from '@/utils/apiCache';

interface CachedRequestOptions {
  forceRefresh?: boolean;
  ttl?: number; // Time to live in minutes
  skipCache?: boolean;
}

class CachedApiClient {
  async get<T>(
    endpoint: string, 
    params?: Record<string, any>, 
    options: CachedRequestOptions = {}
  ): Promise<T> {
    const { forceRefresh = false, ttl = 30, skipCache = false } = options;
    
    // Skip cache for certain endpoints or when explicitly requested
    if (skipCache) {
      console.log(`Skipping cache for ${endpoint}`);
      return apiClient.get<T>(endpoint, params);
    }

    // Try to get from cache first
    const cachedData = apiCache.getCache<T>(endpoint, params, { forceRefresh, ttl });
    if (cachedData && !forceRefresh) {
      return cachedData;
    }

    // Make API call and cache the result
    console.log(`Making API call for ${endpoint}:`, params);
    const data = await apiClient.get<T>(endpoint, params);
    
    // Cache the response
    apiCache.setCache(endpoint, data, params, ttl);
    
    return data;
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    const result = await apiClient.post<T>(endpoint, body);
    
    // Clear related cache entries when posting new data
    this.clearRelatedCache(endpoint);
    
    return result;
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    const result = await apiClient.put<T>(endpoint, body);
    
    // Clear related cache entries when updating data
    this.clearRelatedCache(endpoint);
    
    return result;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const result = await apiClient.delete<T>(endpoint);
    
    // Clear related cache entries when deleting data
    this.clearRelatedCache(endpoint);
    
    return result;
  }

  private clearRelatedCache(endpoint: string): void {
    // Clear cache for list endpoints when individual items are modified
    const patterns = [
      '/institutes',
      '/classes',
      '/subjects',
      '/homework',
      '/lectures',
      '/users'
    ];

    patterns.forEach(pattern => {
      if (endpoint.includes(pattern)) {
        // Clear all cache entries that might be affected
        apiCache.clearUserCache('*'); // This could be improved to be more specific
      }
    });
  }

  // Method to force refresh data
  async refresh<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.get<T>(endpoint, params, { forceRefresh: true });
  }

  // Method to check if data exists in cache
  hasCache(endpoint: string, params?: Record<string, any>): boolean {
    const cachedData = apiCache.getCache(endpoint, params);
    return cachedData !== null;
  }
}

export const cachedApiClient = new CachedApiClient();
