
import { apiClient } from './client';
import { getBaseUrl2 } from '@/contexts/utils/auth.api';

export interface Organization {
  organizationId: string;
  name: string;
  type: 'INSTITUTE' | 'GLOBAL';
  isPublic: boolean;
  instituteId: string | null;
  userRole?: string;
  isVerified?: boolean;
  joinedAt?: string;
  memberCount?: number;
  causeCount?: number;
}

export interface OrganizationCreateData {
  name: string;
  type: 'INSTITUTE' | 'GLOBAL';
  isPublic: boolean;
  enrollmentKey?: string;
  instituteId?: string;
}

export interface OrganizationResponse {
  data: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    sortBy: string;
    sortOrder: string;
  };
}

export interface OrganizationQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: 'INSTITUTE' | 'GLOBAL';
  isPublic?: boolean;
}

export interface OrganizationLoginCredentials {
  email: string;
  password: string;
}

export interface OrganizationLoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    isFirstLogin: boolean;
    lastLoginAt: any;
  };
  permissions: {
    organizations: string[];
    isGlobalAdmin: boolean;
  };
}

class OrganizationApiClient {
  private baseUrl = '/organization/api/v1';

  private checkBaseUrl2(): string {
    const baseUrl2 = getBaseUrl2();
    if (!baseUrl2) {
      throw new Error('Organization base URL not configured. Please set baseUrl2 in the login form.');
    }
    return baseUrl2;
  }

  async loginToOrganization(credentials: OrganizationLoginCredentials): Promise<OrganizationLoginResponse> {
    try {
      // Check if baseUrl2 is configured
      this.checkBaseUrl2();
      
      // Switch to baseUrl2 for organization API calls
      apiClient.setUseBaseUrl2(true);
      
      const response = await apiClient.post<OrganizationLoginResponse>(`${this.baseUrl}/auth/login`, credentials);
      return response;
    } finally {
      // Always switch back to baseUrl1 after organization calls
      apiClient.setUseBaseUrl2(false);
    }
  }

  async getUserEnrolledOrganizations(params?: OrganizationQueryParams): Promise<OrganizationResponse> {
    try {
      this.checkBaseUrl2();
      apiClient.setUseBaseUrl2(true);
      
      const response = await apiClient.get<OrganizationResponse>(`${this.baseUrl}/organizations/user/enrolled`, params);
      return response;
    } finally {
      apiClient.setUseBaseUrl2(false);
    }
  }

  async createOrganization(data: OrganizationCreateData): Promise<Organization> {
    try {
      this.checkBaseUrl2();
      apiClient.setUseBaseUrl2(true);
      
      const response = await apiClient.post<Organization>(`${this.baseUrl}/organizations`, data);
      return response;
    } finally {
      apiClient.setUseBaseUrl2(false);
    }
  }

  async getOrganizations(params?: OrganizationQueryParams): Promise<OrganizationResponse> {
    try {
      this.checkBaseUrl2();
      apiClient.setUseBaseUrl2(true);
      
      const response = await apiClient.get<OrganizationResponse>(`${this.baseUrl}/organizations`, params);
      return response;
    } finally {
      apiClient.setUseBaseUrl2(false);
    }
  }

  async getOrganizationById(id: string): Promise<Organization> {
    try {
      this.checkBaseUrl2();
      apiClient.setUseBaseUrl2(true);
      
      const response = await apiClient.get<Organization>(`${this.baseUrl}/organizations/${id}`);
      return response;
    } finally {
      apiClient.setUseBaseUrl2(false);
    }
  }

  async updateOrganization(id: string, data: Partial<OrganizationCreateData>): Promise<Organization> {
    try {
      this.checkBaseUrl2();
      apiClient.setUseBaseUrl2(true);
      
      const response = await apiClient.put<Organization>(`${this.baseUrl}/organizations/${id}`, data);
      return response;
    } finally {
      apiClient.setUseBaseUrl2(false);
    }
  }

  async deleteOrganization(id: string): Promise<void> {
    try {
      this.checkBaseUrl2();
      apiClient.setUseBaseUrl2(true);
      
      await apiClient.delete(`${this.baseUrl}/organizations/${id}`);
    } finally {
      apiClient.setUseBaseUrl2(false);
    }
  }
}

// Organization-specific API client that uses baseUrl2
class OrganizationSpecificApiClient {
  private getBaseUrl2(): string {
    return getBaseUrl2();
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    const token = localStorage.getItem('org_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP Error: ${response.status}`,
        statusCode: response.status,
        error: response.statusText
      }));
      
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return {} as T;
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const baseUrl = this.getBaseUrl2();
    const url = new URL(`${baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse<T>(response);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const baseUrl = this.getBaseUrl2();
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });

    return this.handleResponse<T>(response);
  }
}

export const organizationApi = new OrganizationApiClient();
export const organizationSpecificApi = new OrganizationSpecificApiClient();
