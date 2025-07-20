
import { apiClient } from './client';

export interface Organization {
  organizationId: string;
  name: string;
  type: 'INSTITUTE' | 'GLOBAL';
  isPublic: boolean;
  instituteId: string | null;
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

class OrganizationApiClient {
  private baseUrl = 'http://localhost:3000/organization/api/v1';

  async createOrganization(data: OrganizationCreateData): Promise<Organization> {
    const response = await apiClient.post<Organization>('/organizations', data);
    return response;
  }

  async getOrganizations(params?: OrganizationQueryParams): Promise<OrganizationResponse> {
    const response = await apiClient.get<OrganizationResponse>('/organizations', params);
    return response;
  }

  async getOrganizationById(id: string): Promise<Organization> {
    const response = await apiClient.get<Organization>(`/organizations/${id}`);
    return response;
  }

  async updateOrganization(id: string, data: Partial<OrganizationCreateData>): Promise<Organization> {
    const response = await apiClient.put<Organization>(`/organizations/${id}`, data);
    return response;
  }

  async deleteOrganization(id: string): Promise<void> {
    await apiClient.delete(`/organizations/${id}`);
  }
}

export const organizationApi = new OrganizationApiClient();
