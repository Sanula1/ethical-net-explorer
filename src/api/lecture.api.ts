
import { apiClient, ApiResponse } from './client';

export interface Lecture {
  id: string;
  instituteId: string;
  classId?: string;
  subjectId?: string;
  instructorId: string;
  title: string;
  description: string;
  lectureType: 'online' | 'physical';
  venue?: string;
  subject?: string;
  startTime?: string;
  endTime?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  meetingLink?: string;
  meetingId?: string;
  meetingPassword?: string;
  recordingUrl?: string;
  isRecorded: boolean;
  maxParticipants: number;
  isActive: boolean;
}

export interface LectureCreateData {
  instituteId: string;
  classId?: string;
  subjectId?: string;
  instructorId: string;
  title: string;
  description: string;
  lectureType: 'online' | 'physical';
  venue?: string | null;
  subject?: string;
  startTime?: string | null;
  endTime?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
  meetingLink?: string | null;
  meetingId?: string | null;
  meetingPassword?: string | null;
  recordingUrl?: string | null;
  isRecorded: boolean;
  maxParticipants: number;
  isActive: boolean;
}

export interface LectureQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  status?: string;
  instituteId?: string;
  classId?: string;
  subjectId?: string;
  isActive?: boolean;
}

class LectureApi {
  async getLectures(params?: LectureQueryParams): Promise<ApiResponse<Lecture[]>> {
    console.log('Fetching lectures with params:', params);
    return apiClient.get<ApiResponse<Lecture[]>>('/institute-class-subject-lectures', params);
  }

  async getInstituteLectures(params?: LectureQueryParams): Promise<ApiResponse<Lecture[]>> {
    console.log('Fetching institute lectures with params:', params);
    return apiClient.get<ApiResponse<Lecture[]>>('/institute-lectures', params);
  }

  async getLectureById(id: string): Promise<Lecture> {
    console.log('Fetching lecture by ID:', id);
    return apiClient.get<Lecture>(`/institute-class-subject-lectures/${id}`);
  }

  async createLecture(data: LectureCreateData, isInstituteLecture: boolean = false): Promise<Lecture> {
    const endpoint = isInstituteLecture ? '/institute-lectures' : '/institute-class-subject-lectures';
    console.log('Creating lecture:', endpoint, data);
    return apiClient.post<Lecture>(endpoint, data);
  }

  async updateLecture(id: string, data: Partial<LectureCreateData>): Promise<Lecture> {
    console.log('Updating lecture:', id, data);
    return apiClient.patch<Lecture>(`/institute-class-subject-lectures/${id}`, data);
  }

  async deleteLecture(id: string): Promise<void> {
    console.log('Deleting lecture:', id);
    return apiClient.delete<void>(`/institute-class-subject-lectures/${id}`);
  }
}

export const lectureApi = new LectureApi();
