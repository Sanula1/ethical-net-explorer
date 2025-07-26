
import { cachedApiClient } from './cachedClient';
import { ApiResponse } from './client';

export interface Institute {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Class {
  id: string;
  instituteId: string;
  name: string;
  code: string;
  academicYear: string;
  level: number;
  grade: number;
  specialty: string;
  classType: string;
  capacity: number;
  classTeacherId?: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  enrollmentCode: string;
  enrollmentEnabled: boolean;
  requireTeacherVerification: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: string;
}

export interface InstituteQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

class InstituteApi {
  async getUserInstitutes(userId: string, forceRefresh = false): Promise<Institute[]> {
    console.log('Fetching user institutes for user:', userId, { forceRefresh });
    const endpoint = `/users/${userId}/institutes`;
    
    return cachedApiClient.get<Institute[]>(endpoint, undefined, { 
      forceRefresh,
      ttl: 60 // Cache for 1 hour since institutes don't change often
    });
  }

  async getInstituteClasses(
    instituteId: string, 
    params?: InstituteQueryParams, 
    forceRefresh = false
  ): Promise<ApiResponse<Class[]>> {
    console.log('Fetching institute classes:', instituteId, params, { forceRefresh });
    const endpoint = '/institute-classes';
    const requestParams = { instituteId, ...params };
    
    return cachedApiClient.get<ApiResponse<Class[]>>(endpoint, requestParams, { 
      forceRefresh,
      ttl: 30 // Cache for 30 minutes
    });
  }

  async getInstituteClassSubjects(
    instituteId: string, 
    classId?: string, 
    forceRefresh = false
  ): Promise<any[]> {
    const endpoint = classId 
      ? `/institute-class-subjects/institute/${instituteId}/class/${classId}`
      : `/institute-class-subjects/institute/${instituteId}`;
    
    console.log('Fetching institute class subjects:', endpoint, { forceRefresh });
    
    return cachedApiClient.get<any[]>(endpoint, undefined, { 
      forceRefresh,
      ttl: 30 // Cache for 30 minutes
    });
  }

  async getInstituteUsers(
    instituteId: string, 
    userType?: string, 
    forceRefresh = false
  ): Promise<ApiResponse<any[]>> {
    const endpoint = '/institute-users';
    const params: any = { instituteId };
    if (userType) params.userType = userType;
    
    console.log('Fetching institute users:', params, { forceRefresh });
    
    return cachedApiClient.get<ApiResponse<any[]>>(endpoint, params, { 
      forceRefresh,
      ttl: 15 // Cache for 15 minutes since user data changes more frequently
    });
  }

  // Method to force refresh all institute data
  async refreshInstituteData(userId: string, instituteId?: string): Promise<void> {
    console.log('Force refreshing institute data...', { userId, instituteId });
    
    // Refresh user institutes
    await this.getUserInstitutes(userId, true);
    
    if (instituteId) {
      // Refresh classes for the institute
      await this.getInstituteClasses(instituteId, undefined, true);
      
      // Refresh subjects for the institute
      await this.getInstituteClassSubjects(instituteId, undefined, true);
      
      // Refresh users for the institute
      await this.getInstituteUsers(instituteId, undefined, true);
    }
  }
}

export const instituteApi = new InstituteApi();
