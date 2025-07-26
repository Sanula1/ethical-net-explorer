
import { getBaseUrl, getBaseUrl2 } from '@/contexts/utils/auth.api';

export interface ApiResponse<T = any> {
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
  };
  success?: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
}

class ApiClient {
  private useBaseUrl2 = false;

  setUseBaseUrl2(use: boolean) {
    this.useBaseUrl2 = use;
  }

  private getCurrentBaseUrl(): string {
    return this.useBaseUrl2 ? getBaseUrl2() : getBaseUrl();
  }

  private getHeaders(): Record<string, string> {
    // With HttpOnly cookies, we don't need to manually add Authorization headers
    // The browser automatically includes the HttpOnly cookie
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP Error: ${response.status}`,
        statusCode: response.status,
        error: response.statusText
      }));
      
      console.error('API Error:', errorData);
      
      // Handle authentication errors
      if (response.status === 401) {
        console.warn('Authentication failed - HttpOnly cookie may be invalid or expired');
        // With HttpOnly cookies, we can't clear them from client-side
        // The server should handle cookie clearing on logout
        // Optionally trigger logout or redirect to login
        window.location.href = '/';
      }
      
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const baseUrl = this.getCurrentBaseUrl();
    const url = new URL(`${baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    console.log('GET Request:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include' // Include HttpOnly cookies automatically
    });

    return this.handleResponse<T>(response);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const baseUrl = this.getCurrentBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    console.log('POST Request:', url, data);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include', // Include HttpOnly cookies automatically
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const baseUrl = this.getCurrentBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    console.log('PUT Request:', url, data);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include', // Include HttpOnly cookies automatically
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    const baseUrl = this.getCurrentBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    console.log('PATCH Request:', url, data);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include', // Include HttpOnly cookies automatically
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    const baseUrl = this.getCurrentBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    console.log('DELETE Request:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include' // Include HttpOnly cookies automatically
    });

    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
