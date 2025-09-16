import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/data-table';
import { DataCardView } from '@/components/ui/data-card-view';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CreateClassForm from '@/components/forms/CreateClassForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface ClassesProps {
  apiLevel?: 'institute' | 'class' | 'subject';
}

interface ClassData {
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
  classTeacherId: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  enrollmentCode: string | null;
  enrollmentEnabled: boolean;
  requireTeacherVerification: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  data: ClassData[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
  };
}

const Classes = ({ apiLevel = 'institute' }: ClassesProps) => {
  const { user, setSelectedClass, selectedInstitute, selectedClass, selectedSubject, setSelectedInstitute, setSelectedSubject } = useAuth();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedClassData, setSelectedClassData] = useState<ClassData | null>(null);
  const [classesData, setClassesData] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('true');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [classTypeFilter, setClassTypeFilter] = useState<string>('all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  const [enrollmentCode, setEnrollmentCode] = useState('');
  const [requireTeacherVerification, setRequireTeacherVerification] = useState(true);

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    console.log('Auth token check:', token ? 'Token found' : 'No token found');
    if (!token) {
      console.error('No authentication token found in localStorage');
      toast({
        title: "Authentication Error",
        description: "No authentication token found. Please login again.",
        variant: "destructive"
      });
      return null;
    }
    return token;
  };

  const getApiHeaders = () => {
    const token = getAuthToken();
    if (!token) return null;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const buildApiUrl = (page = 1, limit = itemsPerPage) => {
    const baseUrl = getBaseUrl();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      isActive: activeFilter
    });

    if (selectedInstitute?.id) {
      params.append('instituteId', selectedInstitute.id);
    }

    if (apiLevel === 'class' && selectedClass?.id) {
      params.append('classId', selectedClass.id);
    }

    if (apiLevel === 'subject' && selectedSubject?.id) {
      params.append('subjectId', selectedSubject.id);
    }

    if (gradeFilter && gradeFilter !== 'all') {
      params.append('grade', gradeFilter);
    }

    if (specialtyFilter && specialtyFilter !== 'all') {
      params.append('specialty', specialtyFilter);
    }

    if (classTypeFilter && classTypeFilter !== 'all') {
      params.append('classType', classTypeFilter);
    }

    if (academicYearFilter && academicYearFilter !== 'all') {
      params.append('academicYear', academicYearFilter);
    }

    if (levelFilter && levelFilter !== 'all') {
      params.append('level', levelFilter);
    }

    if (searchFilter && searchFilter.trim()) {
      params.append('search', searchFilter.trim());
    }

    return `${baseUrl}/institute-classes?${params.toString()}`;
  };

  const handleLoadData = async (page = 1, limit = itemsPerPage) => {
    setIsLoading(true);
    console.log(`Loading classes data for API level: ${apiLevel}`);
    console.log(`Current context - Institute: ${selectedInstitute?.name}, Class: ${selectedClass?.name}, Subject: ${selectedSubject?.name}`);
    
    const headers = getApiHeaders();
    if (!headers) {
      setIsLoading(false);
      return;
    }

    try {
      const url = buildApiUrl(page, limit);
      console.log(`API Request URL: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error('Server returned non-JSON response. This might be an ngrok browser warning page.');
      }

      const result: ApiResponse = await response.json();
      console.log('Classes API Response:', result);

      setClassesData(result.data);
      setTotalItems(result.meta.total);
      setTotalPages(result.meta.totalPages);
      setCurrentPage(result.meta.page);
      setDataLoaded(true);
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${result.data.length} classes.`
      });
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load classes data. This might be due to an API server issue or ngrok browser warning.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInstitute?.id) {
      handleLoadData();
    }
  }, [apiLevel, selectedInstitute, selectedClass, selectedSubject, gradeFilter, activeFilter, specialtyFilter, classTypeFilter, academicYearFilter, levelFilter]);

  const handleBackNavigation = () => {
    if (apiLevel === 'subject' && selectedSubject) {
      setSelectedSubject(null);
    } else if (apiLevel === 'class' && selectedClass) {
      setSelectedClass(null);
    } else if (selectedInstitute) {
      setSelectedInstitute(null);
      setSelectedClass(null);
      setSelectedSubject(null);
    }
  };

  const getPageTitle = () => {
    let title = 'All Classes';
    if (apiLevel === 'subject' && selectedSubject) {
      title += ` (${selectedSubject.name})`;
    } else if (apiLevel === 'class' && selectedClass) {
      title += ` (${selectedClass.name})`;
    } else if (selectedInstitute) {
      title += ` (${selectedInstitute.name})`;
    }
    return title;
  };

  const getBreadcrumbPath = () => {
    const path = [];
    if (selectedInstitute) {
      path.push(`Institute: ${selectedInstitute.name}`);
    }
    if (selectedClass) {
      path.push(`Class: ${selectedClass.name}`);
    }
    if (selectedSubject) {
      path.push(`Subject: ${selectedSubject.name}`);
    }
    return path.join(' → ');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    handleLoadData(page, itemsPerPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    handleLoadData(1, newItemsPerPage);
  };

  const classesColumns = [
    { key: 'name', header: 'Class Name' },
    { key: 'code', header: 'Class Code' },
    { key: 'academicYear', header: 'Academic Year' },
    { key: 'grade', header: 'Grade' },
    { key: 'specialty', header: 'Specialty' },
    { key: 'classType', header: 'Type' },
    { key: 'capacity', header: 'Capacity' },
    { 
      key: 'startDate', 
      header: 'Start Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'endDate', 
      header: 'End Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'enrollmentEnabled',
      header: 'Enrollment',
      render: (value: boolean, row: ClassData) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const handleCreateClass = async (classData: any) => {
    const headers = getApiHeaders();
    if (!headers) return;

    try {
      console.log('Creating class:', classData);
      
      const formattedData = {
        instituteId: selectedInstitute?.id || "1",
        code: classData.code,
        name: classData.name,
        academicYear: classData.academicYear,
        level: parseInt(classData.level),
        grade: parseInt(classData.grade),
        specialty: classData.specialty,
        classType: classData.classType,
        capacity: parseInt(classData.capacity),
        classTeacherId: classData.classTeacherId,
        description: classData.description,
        isActive: true,
        startDate: classData.startDate,
        endDate: classData.endDate,
        enrollmentCode: classData.enrollmentCode,
        enrollmentEnabled: false,
        requireTeacherVerification: true
      };

      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/institute-classes`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const result = await response.json();
      console.log('Class created successfully:', result);

      toast({
        title: "Class Created",
        description: `Class ${classData.name} has been created successfully.`
      });
      
      setIsCreateDialogOpen(false);
      handleLoadData(currentPage, itemsPerPage);
    } catch (error) {
      console.error('Failed to create class:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create class.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateClass = async (classData: any) => {
    const headers = getApiHeaders();
    if (!headers || !selectedClassData) return;

    try {
      console.log('Updating class:', classData);
      
      const formattedData = {
        code: classData.code,
        name: classData.name,
        academicYear: classData.academicYear,
        level: parseInt(classData.level),
        grade: parseInt(classData.grade),
        specialty: classData.specialty,
        classType: classData.classType,
        capacity: parseInt(classData.capacity),
        classTeacherId: classData.classTeacherId,
        description: classData.description,
        startDate: classData.startDate,
        endDate: classData.endDate,
        enrollmentCode: classData.enrollmentCode
      };

      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/institute-classes/${selectedClassData.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const result = await response.json();
      console.log('Class updated successfully:', result);

      toast({
        title: "Class Updated",
        description: `Class ${classData.name} has been updated successfully.`
      });
      
      setIsEditDialogOpen(false);
      setSelectedClassData(null);
      handleLoadData(currentPage, itemsPerPage);
    } catch (error) {
      console.error('Failed to update class:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update class.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClass = async (classData: ClassData) => {
    const headers = getApiHeaders();
    if (!headers) return;

    try {
      console.log('Deleting class:', classData);

      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/institute-classes/${classData.id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Class Deleted",
        description: `Class ${classData.name} has been deleted successfully.`
      });
      
      handleLoadData(currentPage, itemsPerPage);
    } catch (error) {
      console.error('Failed to delete class:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete class.",
        variant: "destructive"
      });
    }
  };

  const handleEditClass = (classData: ClassData) => {
    console.log('Editing class:', classData);
    setSelectedClassData(classData);
    setIsEditDialogOpen(true);
  };

  const handleViewClass = (classData: ClassData) => {
    setSelectedClass(classData);
    toast({
      title: "Class Selected",
      description: `Selected class: ${classData.name}`
    });
  };

  const handleToggleEnrollment = (classData: ClassData) => {
    setSelectedClassData(classData);
    if (!classData.enrollmentEnabled) {
      setEnrollmentCode(classData.enrollmentCode || classData.code || '');
      setRequireTeacherVerification(classData.requireTeacherVerification);
      setIsEnrollmentDialogOpen(true);
    } else {
      handleDisableEnrollment(classData);
    }
  };

  const handleEnableEnrollment = async () => {
    const headers = getApiHeaders();
    if (!headers || !selectedClassData) return;

    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/institute-classes/${selectedClassData.id}/enable-enrollment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          enrollmentCode,
          requireTeacherVerification
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      toast({
        title: "Enrollment Enabled",
        description: `Enrollment has been enabled for ${selectedClassData.name}`
      });
      
      setIsEnrollmentDialogOpen(false);
      setSelectedClassData(null);
      handleLoadData(currentPage, itemsPerPage);
    } catch (error) {
      console.error('Failed to enable enrollment:', error);
      toast({
        title: "Enable Failed",
        description: "Failed to enable enrollment.",
        variant: "destructive"
      });
    }
  };

  const handleDisableEnrollment = async (classData: ClassData) => {
    const headers = getApiHeaders();
    if (!headers) return;

    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/institute-classes/${classData.id}/disable-enrollment`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Enrollment Disabled",
        description: `Enrollment has been disabled for ${classData.name}`
      });
      
      handleLoadData(currentPage, itemsPerPage);
    } catch (error) {
      console.error('Failed to disable enrollment:', error);
      toast({
        title: "Disable Failed",
        description: "Failed to disable enrollment.",
        variant: "destructive"
      });
    }
  };

  const userRole = (user?.role || 'Student') as UserRole;
  const canAdd = AccessControl.hasPermission(userRole, 'create-class');
  const canEdit = AccessControl.hasPermission(userRole, 'edit-class');
  const canDelete = AccessControl.hasPermission(userRole, 'delete-class');

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {(selectedInstitute || selectedClass || selectedSubject) && (
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackNavigation}
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            {getBreadcrumbPath()}
          </div>
        </div>
      )}

      {!dataLoaded ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {getPageTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
            Click the button below to load classes data
          </p>
          <Button 
            onClick={() => handleLoadData()} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Data...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Data
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
                Manage and organize your classes
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {canAdd && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                >
                  Create Class
                </Button>
              )}
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button 
                onClick={() => handleLoadData(1, itemsPerPage)} 
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  Filter Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="grade-filter">Grade Filter</Label>
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="search-filter">Search</Label>
                    <Input
                      id="search-filter"
                      placeholder="Search classes..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialty-filter">Specialty Filter</Label>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Specialties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specialties</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="commerce">Commerce</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="class-type-filter">Class Type Filter</Label>
                    <Select value={classTypeFilter} onValueChange={setClassTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="special">Special</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="remedial">Remedial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level-filter">Level Filter</Label>
                    <Select value={levelFilter} onValueChange={setLevelFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="1">Level 1</SelectItem>
                        <SelectItem value="2">Level 2</SelectItem>
                        <SelectItem value="3">Level 3</SelectItem>
                        <SelectItem value="4">Level 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="academic-year-filter">Academic Year</Label>
                    <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                        <SelectItem value="2026-2027">2026-2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="active-filter">Status Filter</Label>
                    <Select value={activeFilter} onValueChange={setActiveFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={() => {
                        setGradeFilter('all');
                        setSpecialtyFilter('all');
                        setClassTypeFilter('all');
                        setAcademicYearFilter('all');
                        setLevelFilter('all');
                        setActiveFilter('true');
                        setSearchFilter('');
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="hidden md:block">
            <DataTable
              title=""
              data={classesData}
              columns={classesColumns}
              onAdd={canAdd ? () => setIsCreateDialogOpen(true) : undefined}
              onEdit={canEdit ? handleEditClass : undefined}
              onDelete={canDelete ? handleDeleteClass : undefined}
              onView={handleViewClass}
              searchPlaceholder="Search classes..."
              customActions={[
                {
                  label: 'Toggle Enrollment',
                  action: handleToggleEnrollment,
                  variant: 'outline',
                  condition: () => canEdit
                }
              ]}
              currentPage={currentPage}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPage={itemsPerPage}
            />
          </div>

          <div className="md:hidden">
            <DataCardView
              data={classesData}
              columns={classesColumns}
              onView={handleViewClass}
              onEdit={canEdit ? handleEditClass : undefined}
              onDelete={canDelete ? handleDeleteClass : undefined}
              customActions={[
                {
                  label: 'Toggle Enrollment',
                  action: handleToggleEnrollment,
                  variant: 'outline'
                }
              ]}
              allowEdit={canEdit}
              allowDelete={canDelete}
            />

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
          </DialogHeader>
          <CreateClassForm
            onSubmit={handleCreateClass}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <CreateClassForm
            initialData={selectedClassData}
            onSubmit={handleUpdateClass}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedClassData(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEnrollmentDialogOpen} onOpenChange={setIsEnrollmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Enrollment for {selectedClassData?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="enrollment-code">Enrollment Code</Label>
              <Input
                id="enrollment-code"
                value={enrollmentCode}
                onChange={(e) => setEnrollmentCode(e.target.value)}
                placeholder="Enter enrollment code"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="teacher-verification"
                checked={requireTeacherVerification}
                onCheckedChange={setRequireTeacherVerification}
              />
              <Label htmlFor="teacher-verification">Require Teacher Verification</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEnrollmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEnableEnrollment}
                disabled={!enrollmentCode.trim()}
              >
                Enable Enrollment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classes;
