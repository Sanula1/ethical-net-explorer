
import { apiClient, ApiResponse } from './client';

export interface Exam {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  examType: 'online' | 'physical';
  duration: number;
  maxMarks: number;
  passingMarks: number;
  examDate: string;
  startTime: string;
  endTime: string;
  venue?: string;
  examLink?: string;
  instructions?: string;
  status: 'scheduled' | 'draft' | 'completed' | 'cancelled';
  createdBy: string;
  toWhom: string;
  isActive: boolean;
}

export interface ExamCreateData {
  instituteId: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  examType: 'online' | 'physical';
  duration: number;
  maxMarks: number;
  passingMarks: number;
  examDate: string;
  startTime: string;
  endTime: string;
  venue?: string | null;
  examLink?: string | null;
  instructions?: string | null;
  status: 'scheduled' | 'draft' | 'completed' | 'cancelled';
  createdBy: string;
  toWhom: string;
  isActive: boolean;
}

export interface ExamQueryParams {
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

class ExamApi {
  async getExams(params?: ExamQueryParams): Promise<ApiResponse<Exam[]>> {
    console.log('Fetching exams with params:', params);
    return apiClient.get<ApiResponse<Exam[]>>('/institute-class-subject-exams', params);
  }

  async getExamById(id: string): Promise<Exam> {
    console.log('Fetching exam by ID:', id);
    return apiClient.get<Exam>(`/institute-class-subject-exams/${id}`);
  }

  async createExam(data: ExamCreateData): Promise<Exam> {
    console.log('Creating exam:', data);
    return apiClient.post<Exam>('/institute-class-subject-exams', data);
  }

  async updateExam(id: string, data: Partial<ExamCreateData>): Promise<Exam> {
    console.log('Updating exam:', id, data);
    return apiClient.patch<Exam>(`/institute-class-subject-exams/${id}`, data);
  }

  async deleteExam(id: string): Promise<void> {
    console.log('Deleting exam:', id);
    return apiClient.delete<void>(`/institute-class-subject-exams/${id}`);
  }
}

export const examApi = new ExamApi();
