
import { apiClient } from './client';

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

  private ensureBaseUrl2() {
    // Always use baseUrl2 for organization API calls
    apiClient.setUseBaseUrl2(true);
  }

  async loginToOrganization(credentials: OrganizationLoginCredentials): Promise<OrganizationLoginResponse> {
    this.ensureBaseUrl2();
    const response = await apiClient.post<OrganizationLoginResponse>(`${this.baseUrl}/auth/login`, credentials);
    return response;
  }

  async getUserEnrolledOrganizations(params?: OrganizationQueryParams): Promise<OrganizationResponse> {
    this.ensureBaseUrl2();
    const response = await apiClient.get<OrganizationResponse>(`${this.baseUrl}/organizations/user/enrolled`, params);
    return response;
  }

  async createOrganization(data: OrganizationCreateData): Promise<Organization> {
    this.ensureBaseUrl2();
    const response = await apiClient.post<Organization>(`${this.baseUrl}/organizations`, data);
    return response;
  }

  async getOrganizations(params?: OrganizationQueryParams): Promise<OrganizationResponse> {
    this.ensureBaseUrl2();
    const response = await apiClient.get<OrganizationResponse>(`${this.baseUrl}/organizations`, params);
    return response;
  }

  async getOrganizationById(id: string): Promise<Organization> {
    this.ensureBaseUrl2();
    const response = await apiClient.get<Organization>(`${this.baseUrl}/organizations/${id}`);
    return response;
  }

  async updateOrganization(id: string, data: Partial<OrganizationCreateData>): Promise<Organization> {
    this.ensureBaseUrl2();
    const response = await apiClient.put<Organization>(`${this.baseUrl}/organizations/${id}`, data);
    return response;
  }

  async deleteOrganization(id: string): Promise<void> {
    this.ensureBaseUrl2();
    await apiClient.delete(`${this.baseUrl}/organizations/${id}`);
  }
}

export const organizationApi = new OrganizationApiClient();
