
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, BookOpen, Images, ArrowLeft, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationSpecificApi } from '@/api/organization.api';

interface Course {
  causeId: string;
  title: string;
  description: string;
  isPublic: boolean;
  organizationId: string;
}

interface CoursesResponse {
  data: Course[];
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

interface OrganizationDashboardProps {
  organization: any;
  onBack: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const OrganizationDashboard = ({ organization, onBack, currentPage, onPageChange }: OrganizationDashboardProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateCourseForm, setShowCreateCourseForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentPage === 'courses') {
      loadCourses();
    }
  }, [currentPage]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const response = await organizationSpecificApi.get<CoursesResponse>('/organization/api/v1/causes', {
        page: 1,
        limit: 10
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (courseData: any) => {
    try {
      const response = await organizationSpecificApi.post<Course>('/organization/api/v1/causes', {
        ...courseData,
        organizationId: organization.organizationId
      });
      
      setCourses(prev => [response, ...prev]);
      setShowCreateCourseForm(false);
      
      toast({
        title: "Success",
        description: "Course created successfully",
      });
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'organization':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onPageChange('gallery')}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Images className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Gallery</CardTitle>
                      <CardDescription>Organization Pictures</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onPageChange('students')}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Students</CardTitle>
                      <CardDescription>All Students</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onPageChange('courses')}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Courses</CardTitle>
                      <CardDescription>Organization Courses</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Organization Pictures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <Images className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">No images available</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'students':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">All Students</h2>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No students found</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'courses':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Courses</h2>
              <Button onClick={() => setShowCreateCourseForm(true)}>
                Create Course
              </Button>
            </div>

            {showCreateCourseForm && (
              <CreateCourseForm
                onSubmit={handleCreateCourse}
                onCancel={() => setShowCreateCourseForm(false)}
              />
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading courses...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.causeId} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Award className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription>{course.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={course.isPublic ? "default" : "secondary"}>
                          {course.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            {courses.length === 0 && !isLoading && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No courses found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{organization.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Organization Management</p>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

const CreateCourseForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 border rounded-md"
              rows={3}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            />
            <label htmlFor="isPublic" className="text-sm font-medium">Public Course</label>
          </div>
          <div className="flex space-x-2">
            <Button type="submit">Create Course</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrganizationDashboard;
