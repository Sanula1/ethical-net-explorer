import { apiClient } from './client';
import { apiCache } from '@/utils/apiCache';

interface CachedRequestOptions {
  forceRefresh?: boolean;
  ttl?: number; // Time to live in minutes
  skipCache?: boolean;
  useStaleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
}

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class CachedApiClient {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly PENDING_REQUEST_TTL = 30000; // 30 seconds

  private generateRequestKey(endpoint: string, params?: Record<string, any>): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private async checkCacheAvailability(): Promise<boolean> {
    try {
      const stats = await apiCache.getCacheStats();
      return stats.storageType !== 'memory' || true;
    } catch {
      return false;
    }
  }

  private cleanupPendingRequests(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.PENDING_REQUEST_TTL) {
        this.pendingRequests.delete(key);
      }
    }
  }

  async get<T>(
    endpoint: string, 
    params?: Record<string, any>, 
    options: CachedRequestOptions = {}
  ): Promise<T> {
    const { 
      forceRefresh = false, 
      ttl = 30, 
      skipCache = false,
      useStaleWhileRevalidate = true
    } = options;
    
    const requestKey = this.generateRequestKey(endpoint, params);
    
    console.log(`Enhanced cache request for ${endpoint}:`, { 
      params, 
      forceRefresh, 
      skipCache, 
      ttl, 
      useStaleWhileRevalidate 
    });

    // Clean up old pending requests
    this.cleanupPendingRequests();

    // Check if same request is already pending
    const pendingRequest = this.pendingRequests.get(requestKey);
    if (pendingRequest && !forceRefresh) {
      console.log(`Request already pending for ${endpoint}, waiting for result`);
      return pendingRequest.promise;
    }

    // Skip cache for certain endpoints or when explicitly requested
    if (skipCache) {
      console.log(`Skipping cache for ${endpoint}`);
      return this.makeDirectApiCall(endpoint, params, requestKey);
    }

    // Check if caching is available
    const cacheAvailable = await this.checkCacheAvailability();
    if (!cacheAvailable) {
      console.log(`Cache not available, making direct API call for ${endpoint}`);
      return this.makeDirectApiCall(endpoint, params, requestKey);
    }

    try {
      let cachedData: T | null = null;

      // Always check cache first unless forcing refresh
      if (!forceRefresh) {
        cachedData = await apiCache.getCache<T>(endpoint, params, { ttl });
        
        if (cachedData !== null) {
          console.log(`Cache HIT for ${endpoint} - returning cached data`);
          
          // If using stale-while-revalidate, trigger background refresh for frequently accessed data
          if (useStaleWhileRevalidate) {
            console.log(`Triggering background refresh for ${endpoint}`);
            // Start background refresh but don't wait for it
            this.backgroundRefresh(endpoint, params, ttl, requestKey);
          }
          
          return cachedData;
        }
        console.log(`Cache MISS for ${endpoint} - making API call`);
      } else {
        console.log(`Force refresh requested for ${endpoint} - skipping cache check`);
      }

      // Make API call and cache the result
      return this.makeApiCallAndCache(endpoint, params, ttl, requestKey);
      
    } catch (cacheError) {
      console.warn('Cache operation failed, making direct API call:', cacheError);
      return this.makeDirectApiCall(endpoint, params, requestKey);
    }
  }

  private async backgroundRefresh(
    endpoint: string, 
    params: Record<string, any> | undefined, 
    ttl: number,
    requestKey: string
  ): Promise<void> {
    try {
      // Don't block the current request, but update cache in background
      setTimeout(async () => {
        try {
          console.log(`Background refresh for ${endpoint}`);
          const data = await apiClient.get<any>(endpoint, params);
          await apiCache.setCache(endpoint, data, params, ttl);
          console.log(`Background refresh completed for ${endpoint}`);
        } catch (error) {
          console.warn(`Background refresh failed for ${endpoint}:`, error);
        }
      }, 100); // Small delay to not impact current request
    } catch (error) {
      console.warn('Background refresh setup failed:', error);
    }
  }

  private async makeDirectApiCall<T>(
    endpoint: string, 
    params: Record<string, any> | undefined,
    requestKey: string
  ): Promise<T> {
    const apiPromise = apiClient.get<T>(endpoint, params);
    
    // Track pending request
    this.pendingRequests.set(requestKey, {
      promise: apiPromise,
      timestamp: Date.now()
    });

    try {
      const result = await apiPromise;
      this.pendingRequests.delete(requestKey);
      return result;
    } catch (error) {
      this.pendingRequests.delete(requestKey);
      throw error;
    }
  }

  private async makeApiCallAndCache<T>(
    endpoint: string,
    params: Record<string, any> | undefined,
    ttl: number,
    requestKey: string
  ): Promise<T> {
    console.log(`Making API call for ${endpoint}:`, params);
    
    const apiPromise = apiClient.get<T>(endpoint, params);
    
    // Track pending request
    this.pendingRequests.set(requestKey, {
      promise: apiPromise,
      timestamp: Date.now()
    });

    try {
      const data = await apiPromise;
      
      // Cache the response
      await apiCache.setCache(endpoint, data, params, ttl);
      console.log(`Data cached for ${endpoint} with TTL ${ttl} minutes`);
      
      this.pendingRequests.delete(requestKey);
      return data;
    } catch (error) {
      this.pendingRequests.delete(requestKey);
      throw error;
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

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    const result = await apiClient.patch<T>(endpoint, body);
    
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
      // Enhanced cache clearing patterns
      const patterns = [
        '/institutes',
        '/classes',
        '/subjects',
        '/homework',
        '/lectures',
        '/exams',
        '/users',
        '/institute-class',
        '/institute-users',
        '/attendance',
        '/organization'
      ];

      for (const pattern of patterns) {
        if (endpoint.includes(pattern)) {
          console.log(`Clearing related cache for pattern: ${pattern}`);
          // Clear specific cache entries that might be affected
          await this.clearCacheByPattern(pattern);
          break;
        }
      }
    } catch (error) {
      console.warn('Failed to clear related cache:', error);
    }
  }

  private async clearCacheByPattern(pattern: string): Promise<void> {
    try {
      // This would ideally clear cache entries matching a pattern
      // For now, we'll clear all cache as a safer approach
      await apiCache.clearAllCache();
    } catch (error) {
      console.warn('Failed to clear cache by pattern:', error);
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

  // Method to preload data into cache
  async preload<T>(endpoint: string, params?: Record<string, any>, ttl?: number): Promise<void> {
    try {
      console.log(`Preloading data for ${endpoint}`);
      await this.get<T>(endpoint, params, { ttl, useStaleWhileRevalidate: false });
    } catch (error) {
      console.warn(`Failed to preload data for ${endpoint}:`, error);
    }
  }

  // Method to get cache statistics
  async getCacheStats() {
    return apiCache.getCacheStats();
  }

  // Method to clear all pending requests
  clearPendingRequests(): void {
    this.pendingRequests.clear();
  }
}

export const cachedApiClient = new CachedApiClient();
