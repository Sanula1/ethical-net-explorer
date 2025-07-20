import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataCardView } from '@/components/ui/data-card-view';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { School, Users, BookOpen, Clock, RefreshCw, User, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ClassData {
  id: string;
  name: string;
  code: string;
  grade?: number;
  level?: number;
  capacity?: number;
  enrollmentCode?: string;
  academicYear?: string;
  specialty?: string;
  classType?: string;
  description?: string;
  classTeacherId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  instituteId?: string;
  _count?: {
    students: number;
    subjects: number;
  };
}

interface TeacherClassSubjectData {
  instituteId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  class: {
    id: string;
    name: string;
    code: string;
    classTeacherId?: string;
  };
  isActive: boolean;
  schedule?: any;
  notes?: any;
  createdAt: string;
  updatedAt: string;
}

interface ClassCardData {
  id: string;
  name: string;
  code: string;
  description: string;
  capacity: number;
  studentCount: number;
  subjectCount: number;
  academicYear: string;
  specialty: string;
  classType: string;
  isActive: boolean;
}

const ClassSelector = () => {
  const { user, selectedInstitute, setSelectedClass, currentInstituteId } = useAuth();
  const { toast } = useToast();
  const [classesData, setClassesData] = useState<ClassCardData[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [classTypeFilter, setClassTypeFilter] = useState<string>('all');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    return token;
  };

  const getApiHeaders = () => {
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const fetchClassesByRole = async () => {
    setIsLoading(true);
    console.log('Loading classes data for user role:', user?.role);
    
    try {
      const baseUrl = getBaseUrl();
      const headers = getApiHeaders();
      let url = '';
      
      const userRole = (user?.role || 'Student') as UserRole;
      
      if (userRole === 'Student') {
        url = `${baseUrl}/institute-class-students/student/${user?.id}/classes?limit=100&instituteId=${currentInstituteId}&isActive=true`;
      } else if (userRole === 'Teacher') {
        url = `${baseUrl}/institute-class-subjects/institute/${currentInstituteId}/teacher/${user?.id}`;
      } else if (userRole === 'InstituteAdmin' || userRole === 'AttendanceMarker') {
        url = `${baseUrl}/institute-classes?instituteId=${currentInstituteId}`;
      } else {
        throw new Error('Unsupported user role for class selection');
      }

      console.log('Fetching from URL:', url);
      
      let response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok && (userRole === 'InstituteAdmin' || userRole === 'AttendanceMarker')) {
        console.log('First endpoint failed, trying alternative...');
        url = `${baseUrl}/classes?instituteId=${currentInstituteId}`;
        response = await fetch(url, {
          method: 'GET',
          headers
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch classes data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw API response:', result);
      
      let classesArray: ClassData[] = [];
      
      if (userRole === 'Teacher') {
        let teacherClassSubjects: TeacherClassSubjectData[] = [];
        
        if (Array.isArray(result)) {
          teacherClassSubjects = result;
        } else if (result.data && Array.isArray(result.data)) {
          teacherClassSubjects = result.data;
        }

        const uniqueClasses = new Map<string, ClassData>();
        
        teacherClassSubjects.forEach((item: TeacherClassSubjectData) => {
          if (!uniqueClasses.has(item.classId)) {
            uniqueClasses.set(item.classId, {
              id: item.classId,
              name: item.class.name,
              code: item.class.code,
              description: `${item.class.name} - Teaching ${item.subject.name}`,
              specialty: 'Teacher Assignment',
              classType: 'Teaching',
              academicYear: 'Current',
              isActive: item.isActive,
              capacity: 0,
              classTeacherId: item.class.classTeacherId,
              _count: {
                students: 0,
                subjects: 1
              }
            });
          } else {
            const existingClass = uniqueClasses.get(item.classId)!;
            if (existingClass._count) {
              existingClass._count.subjects += 1;
            }
          }
        });

        classesArray = Array.from(uniqueClasses.values());
      } else {
        if (Array.isArray(result)) {
          classesArray = result;
        } else if (result.data && Array.isArray(result.data)) {
          classesArray = result.data;
        } else {
          console.warn('Unexpected response structure:', result);
          classesArray = [];
        }
      }

      const transformedClasses = classesArray.map((classItem: ClassData): ClassCardData => ({
        id: classItem.id,
        name: classItem.name,
        code: classItem.code,
        description: classItem.description || `${classItem.name} - ${classItem.specialty || classItem.classType || 'General'}`,
        capacity: classItem.capacity || 0,
        studentCount: classItem._count?.students || 0,
        subjectCount: classItem._count?.subjects || 0,
        academicYear: classItem.academicYear || 'N/A',
        specialty: classItem.specialty || classItem.classType || 'General',
        classType: classItem.classType || 'Regular',
        isActive: classItem.isActive !== false
      }));

      console.log('Transformed classes:', transformedClasses);
      setClassesData(transformedClasses);
      setFilteredClasses(transformedClasses);
      setDataLoaded(true);
      
      toast({
        title: "Classes Loaded",
        description: `Successfully loaded ${transformedClasses.length} classes.`
      });
      
    } catch (error) {
      console.error('Failed to load classes:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load classes data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = classesData;

    if (searchTerm) {
      filtered = filtered.filter(classItem =>
        classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(classItem =>
        classItem.name.toLowerCase().includes(`grade ${gradeFilter}`) ||
        classItem.description.toLowerCase().includes(`grade ${gradeFilter}`)
      );
    }

    if (specialtyFilter !== 'all') {
      filtered = filtered.filter(classItem => 
        classItem.specialty.toLowerCase().includes(specialtyFilter.toLowerCase())
      );
    }

    if (classTypeFilter !== 'all') {
      filtered = filtered.filter(classItem => 
        classItem.classType.toLowerCase().includes(classTypeFilter.toLowerCase())
      );
    }

    if (academicYearFilter !== 'all') {
      filtered = filtered.filter(classItem => 
        classItem.academicYear === academicYearFilter
      );
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(classItem => classItem.isActive === isActive);
    }

    setFilteredClasses(filtered);
  }, [classesData, searchTerm, gradeFilter, specialtyFilter, classTypeFilter, academicYearFilter, statusFilter]);

  const handleSelectClass = (classData: ClassCardData) => {
    console.log('Selecting class:', classData);
    
    setSelectedClass({
      id: classData.id,
      name: classData.name,
      code: classData.code,
      description: classData.description,
      grade: 0,
      specialty: classData.specialty || 'General'
    });

    toast({
      title: "Class Selected",
      description: `Selected ${classData.name} (${classData.code})`
    });
  };

  useEffect(() => {
    if (user && currentInstituteId) {
      fetchClassesByRole();
    }
  }, [user, currentInstituteId]);

  const tableColumns = [
    {
      key: 'name',
      header: 'Class Name',
      render: (value: any, row: ClassCardData) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.code}</div>
        </div>
      )
    },
    {
      key: 'specialty',
      header: 'Type',
      render: (value: any, row: ClassCardData) => (
        <div className="text-sm">
          <div>{value}</div>
          <div className="text-gray-500">{row.classType}</div>
        </div>
      )
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
      render: (value: any) => <span className="text-sm">{value}</span>
    },
    {
      key: 'studentCount',
      header: 'Students',
      render: (value: any, row: ClassCardData) => `${value}/${row.capacity || 'N/A'}`
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value: any) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const customActions = [
    {
      label: 'Select',
      action: (classData: ClassCardData) => handleSelectClass(classData),
      icon: <School className="h-3 w-3" />,
      variant: 'default' as const
    }
  ];

  if (!user) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view classes.</p>
      </div>
    );
  }

  if (!currentInstituteId) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-gray-600 dark:text-gray-400">Please select an institute first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Select Class
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Choose a class to manage lectures and attendance
          </p>
          {selectedInstitute && (
            <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-2">
              Institute: {selectedInstitute.name}
            </p>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button 
            onClick={fetchClassesByRole} 
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
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

      {/* Filters */}
      {dataLoaded && showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {Array.from({ length: 13 }, (_, i) => i).map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>
                        {grade === 0 ? 'Kindergarten' : `Grade ${grade}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
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

              <div className="space-y-2">
                <Label htmlFor="classType">Class Type</Label>
                <Select value={classTypeFilter} onValueChange={setClassTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="remedial">Remedial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredClasses.length} of {classesData.length} classes
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setGradeFilter('all');
                  setSpecialtyFilter('all');
                  setClassTypeFilter('all');
                  setAcademicYearFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!dataLoaded ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
            Click the refresh button above to load your classes
          </p>
          <Button 
            onClick={fetchClassesByRole} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Classes...
              </>
            ) : (
              <>
                <School className="h-4 w-4 mr-2" />
                Load My Classes
              </>
            )}
          </Button>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {searchTerm || gradeFilter !== 'all' || specialtyFilter !== 'all' || classTypeFilter !== 'all' || academicYearFilter !== 'all' || statusFilter !== 'all'
              ? 'No classes match your current filters.'
              : 'No classes found for your role.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile View Content - Always Card View */}
          <div className="md:hidden">
            <DataCardView
              data={filteredClasses}
              columns={tableColumns}
              customActions={customActions}
              allowEdit={false}
              allowDelete={false}
            />
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredClasses.map((classItem) => (
                <Card 
                  key={classItem.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-blue-500"
                  onClick={() => handleSelectClass(classItem)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <School className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                      <Badge 
                        variant={classItem.isActive ? "default" : "secondary"}
                        className={classItem.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {classItem.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{classItem.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Code: {classItem.code}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {classItem.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{classItem.studentCount}/{classItem.capacity || 'N/A'} Students</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>{classItem.subjectCount} Subjects</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Academic Year: {classItem.academicYear}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <User className="h-4 w-4 mr-2" />
                        <span>Type: {classItem.specialty}</span>
                      </div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                      Select Class
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClassSelector;
