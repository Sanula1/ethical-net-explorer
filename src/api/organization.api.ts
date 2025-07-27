
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

export const organizationApi = new OrganizationApiClient();
