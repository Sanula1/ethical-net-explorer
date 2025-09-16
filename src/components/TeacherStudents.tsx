import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RefreshCw, Users, Mail, Phone, Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { DataCardView } from '@/components/ui/data-card-view';
import DataTable from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClassStudent {
  ics_student_user_id: string;
  ics_is_active: number;
  ics_created_at: string;
  s_student_id: string | null;
  u_first_name: string;
  u_last_name: string;
  u_email: string;
  u_phone_number: string;
}

interface SubjectStudent {
  instituteId: string;
  classId: string;
  subjectId: string;
  studentId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userType: string;
    dateOfBirth: string;
    gender: string;
    imageUrl: string | null;
    isActive: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubjectStudentsResponse {
  data: SubjectStudent[];
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

const TeacherStudents = () => {
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<ClassStudent[] | SubjectStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Role check - only teachers can access this component
  if (user?.role !== 'Teacher') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Access denied. This section is only available for teachers.
        </p>
      </div>
    );
  }

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const fetchClassStudents = async () => {
    if (!selectedInstitute?.id || !selectedClass?.id) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${getBaseUrl()}/institutes/${selectedInstitute.id}/classes/${selectedClass.id}/students`,
        { headers: getApiHeaders() }
      );
      
      if (response.ok) {
        const data: ClassStudent[] = await response.json();
        setStudents(data);
        setDataLoaded(true);
        
        toast({
          title: "Students Loaded",
          description: `Successfully loaded ${data.length} students.`
        });
      } else {
        throw new Error('Failed to fetch class students');
      }
    } catch (error) {
      console.error('Error fetching class students:', error);
      toast({
        title: "Error",
        description: "Failed to load class students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectStudents = async () => {
    if (!selectedInstitute?.id || !selectedClass?.id || !selectedSubject?.id) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        instituteId: selectedInstitute.id,
        classId: selectedClass.id,
        subjectId: selectedSubject.id,
        studentId: '',
        page: '1',
        limit: '10'
      });

      const response = await fetch(
        `${getBaseUrl()}/institute-class-subject-students?${params}`,
        { headers: getApiHeaders() }
      );
      
      if (response.ok) {
        const data: SubjectStudentsResponse = await response.json();
        setStudents(data.data);
        setDataLoaded(true);
        
        toast({
          title: "Students Loaded",
          description: `Successfully loaded ${data.data.length} students.`
        });
      } else {
        throw new Error('Failed to fetch subject students');
      }
    } catch (error) {
      console.error('Error fetching subject students:', error);
      toast({
        title: "Error",
        description: "Failed to load subject students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedInstitute?.id && selectedClass?.id) {
      if (selectedSubject?.id) {
        fetchSubjectStudents();
      } else {
        fetchClassStudents();
      }
    }
  }, [selectedInstitute, selectedClass, selectedSubject]);

  const isClassStudent = (student: ClassStudent | SubjectStudent): student is ClassStudent => {
    return 'u_first_name' in student;
  };

  const getStudentName = (student: ClassStudent | SubjectStudent) => {
    if (isClassStudent(student)) {
      return `${student.u_first_name} ${student.u_last_name}`;
    }
    return `${student.student.firstName} ${student.student.lastName}`;
  };

  const getStudentEmail = (student: ClassStudent | SubjectStudent) => {
    if (isClassStudent(student)) {
      return student.u_email;
    }
    return student.student.email;
  };

  const getStudentPhone = (student: ClassStudent | SubjectStudent) => {
    if (isClassStudent(student)) {
      return student.u_phone_number;
    }
    return student.student.phoneNumber;
  };

  const getStudentImage = (student: ClassStudent | SubjectStudent) => {
    if (isClassStudent(student)) {
      return null; // Class students don't have image in the response
    }
    return student.student.imageUrl;
  };

  const getStudentStatus = (student: ClassStudent | SubjectStudent) => {
    if (isClassStudent(student)) {
      return student.ics_is_active === 1;
    }
    return student.isActive;
  };

  const studentColumns = [
    {
      key: 'name',
      header: 'Student',
      render: (value: any, row: ClassStudent | SubjectStudent) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarImage src={getStudentImage(row) || ''} alt={getStudentName(row)} />
            <AvatarFallback className="text-xs">
              {getStudentName(row).split(' ').map(n => n.charAt(0)).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{getStudentName(row)}</p>
            <p className="text-sm text-gray-500 truncate">{getStudentEmail(row)}</p>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (value: any, row: ClassStudent | SubjectStudent) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{getStudentPhone(row)}</span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{getStudentEmail(row)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: any, row: ClassStudent | SubjectStudent) => (
        <Badge variant={getStudentStatus(row) ? 'default' : 'secondary'}>
          {getStudentStatus(row) ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  const filteredStudents = students.filter(student => {
    const name = getStudentName(student).toLowerCase();
    const email = getStudentEmail(student).toLowerCase();
    const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && getStudentStatus(student)) || 
      (statusFilter === 'inactive' && !getStudentStatus(student));
    
    return matchesSearch && matchesStatus;
  });

  const getTitle = () => {
    if (selectedSubject) {
      return `Subject Students - ${selectedSubject.name}`;
    }
    if (selectedClass) {
      return `Class Students - ${selectedClass.name}`;
    }
    return 'Students';
  };

  const getCurrentSelection = () => {
    const parts = [];
    if (selectedInstitute) parts.push(`Institute: ${selectedInstitute.name}`);
    if (selectedClass) parts.push(`Class: ${selectedClass.name}`);
    if (selectedSubject) parts.push(`Subject: ${selectedSubject.name}`);
    return parts.join(' → ');
  };

  if (!selectedInstitute || !selectedClass) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Select Class
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please select an institute and class to view students.
          </p>
        </div>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {getTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Current Selection: {getCurrentSelection()}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load students
          </p>
          <Button 
            onClick={selectedSubject ? fetchSubjectStudents : fetchClassStudents} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Students...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Load Students
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Current Selection: {getCurrentSelection()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {students.length} Students
          </Badge>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button 
            onClick={selectedSubject ? fetchSubjectStudents : fetchClassStudents} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
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

      {/* Filter Controls */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Students Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No students match your current filters.' 
                : 'No students are enrolled in this selection.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              title=""
              data={filteredStudents}
              columns={studentColumns}
              searchPlaceholder="Search students..."
              allowAdd={false}
              allowEdit={false}
              allowDelete={false}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <DataCardView
              data={filteredStudents}
              columns={studentColumns}
              allowEdit={false}
              allowDelete={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TeacherStudents;