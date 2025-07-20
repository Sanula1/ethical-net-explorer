
import { apiClient, ApiResponse } from './client';

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
  async getUserInstitutes(userId: string): Promise<Institute[]> {
    console.log('Fetching user institutes for user:', userId);
    return apiClient.get<Institute[]>(`/users/${userId}/institutes`);
  }

  async getInstituteClasses(instituteId: string, params?: InstituteQueryParams): Promise<ApiResponse<Class[]>> {
    console.log('Fetching institute classes:', instituteId, params);
    return apiClient.get<ApiResponse<Class[]>>('/institute-classes', { 
      instituteId, 
      ...params 
    });
  }

  async getInstituteClassSubjects(instituteId: string, classId?: string): Promise<any[]> {
    const endpoint = classId 
      ? `/institute-class-subjects/institute/${instituteId}/class/${classId}`
      : `/institute-class-subjects/institute/${instituteId}`;
    
    console.log('Fetching institute class subjects:', endpoint);
    return apiClient.get<any[]>(endpoint);
  }

  async getInstituteUsers(instituteId: string, userType?: string): Promise<ApiResponse<any[]>> {
    const params: any = { instituteId };
    if (userType) params.userType = userType;
    
    console.log('Fetching institute users:', params);
    return apiClient.get<ApiResponse<any[]>>('/institute-users', params);
  }
}

export const instituteApi = new InstituteApi();
