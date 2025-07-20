import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import DataTable from '@/components/ui/data-table';
import { Eye, User, Phone, Mail, MapPin, BookOpen, Search, Filter, RefreshCw, Users, FileText } from 'lucide-react';
import CreateStudentForm from '@/components/forms/CreateStudentForm';
import AssignParentForm from '@/components/forms/AssignParentForm';
import { getBaseUrl, getApiHeaders } from '@/contexts/utils/auth.api';
import { DataCardView } from '@/components/ui/data-card-view';

interface Student {
  userId: string;
  studentId: string;
  grade: string;
  bloodGroup: string;
  emergencyContact: string;
  medicalConditions: string;
  allergies: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: string;
    dateOfBirth: string;
    gender: string;
    imageUrl: string | null;
  };
}

interface StudentsResponse {
  data: Student[];
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

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showAssignParentDialog, setShowAssignParentDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (gradeFilter !== 'all') {
        params.append('grade', gradeFilter);
      }
      if (genderFilter !== 'all') {
        params.append('gender', genderFilter);
      }
      console.log('Fetching students with params:', params.toString());
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/students?${params}`, {
        headers: getApiHeaders()
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: StudentsResponse = await response.json();
      console.log('Students data received:', data);
      setStudents(data.data);
      setTotalPages(data.meta.totalPages);
      setTotalItems(data.meta.total);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadData = () => {
    fetchStudents();
  };

  useEffect(() => {
    if (!dataLoaded) {
      handleLoadData();
    }
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      fetchStudents();
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, gradeFilter, genderFilter]);

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewDialog(true);
  };

  const handleAssignParent = (student: Student) => {
    setSelectedStudent(student);
    setShowAssignParentDialog(true);
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete student ${student.user.firstName} ${student.user.lastName}?`)) {
      return;
    }
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/students/${student.userId}`, {
        method: 'DELETE',
        headers: getApiHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
      toast({
        title: "Student Deleted",
        description: `Student ${student.user.firstName} ${student.user.lastName} has been deleted.`,
        variant: "destructive"
      });
      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete student. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateStudent = async (studentData: any) => {
    try {
      setLoading(true);
      const headers = getApiHeaders();
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/students`, {
        method: 'POST',
        headers,
        body: JSON.stringify(studentData)
      });
      if (!response.ok) {
        throw new Error('Failed to create student');
      }
      toast({
        title: "Student Created",
        description: `Student ${studentData.user.firstName} ${studentData.user.lastName} has been created successfully.`
      });
      setShowCreateDialog(false);
      await fetchStudents();
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignParentSubmit = async (parentData: any) => {
    if (!selectedStudent) return;
    try {
      setLoading(true);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/students/${selectedStudent.userId}/assign-parent`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(parentData)
      });
      if (!response.ok) {
        throw new Error('Failed to assign parent');
      }
      toast({
        title: "Parent Assigned",
        description: `Parent has been assigned to ${selectedStudent.user.firstName} ${selectedStudent.user.lastName} successfully.`
      });
      setShowAssignParentDialog(false);
      setSelectedStudent(null);
      await fetchStudents();
    } catch (error) {
      console.error('Error assigning parent:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign parent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [{
    key: 'user.firstName',
    header: 'Student',
    render: (value: any, row: Student) => <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarImage src={row.user.imageUrl || ''} alt={row.user.firstName} />
            <AvatarFallback className="text-xs">
              {row.user.firstName.charAt(0)}{row.user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{row.user.firstName} {row.user.lastName}</p>
            <p className="text-sm text-gray-500 truncate">{row.user.email}</p>
          </div>
        </div>
  }, {
    key: 'studentId',
    header: 'Student ID'
  }, {
    key: 'user.phone',
    header: 'Contact',
    render: (value: any, row: Student) => <div className="space-y-1">
          <div className="flex items-center text-sm">
            <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{row.user.phone}</span>
          </div>
          <div className="flex items-center text-sm">
            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{row.user.email}</span>
          </div>
        </div>
  }, {
    key: 'user.gender',
    header: 'Gender'
  }, {
    key: 'bloodGroup',
    header: 'Blood Group'
  }, {
    key: 'isActive',
    header: 'Status',
    render: (value: boolean) => <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
  }];

  // Filter students for mobile view
  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || Object.values(student.user).some(value => String(value).toLowerCase().includes(searchTerm.toLowerCase())) || student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || String(student.isActive) === statusFilter;
    const matchesGender = genderFilter === 'all' || student.user.gender === genderFilter;
    return matchesSearch && matchesStatus && matchesGender;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          
          
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          <Badge variant="outline" className="text-sm">
            {totalItems} Total Students
          </Badge>
        </div>
      </div>

      {!dataLoaded ? (
        <div className="text-center py-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Students Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load students data
          </p>
          <Button onClick={handleLoadData} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Data...
              </> : <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Data
              </>}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  Create Student
                </Button>
                <Button onClick={handleLoadData} disabled={loading} variant="outline" className="flex items-center gap-2">
                  {loading ? <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Refreshing...
                    </> : <>
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </>}
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            {showFilters && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Search Students
                  </label>
                  <Input placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full" />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Gender
                  </label>
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setGradeFilter('all');
              setGenderFilter('all');
            }} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              title=""
              data={students}
              columns={columns}
              onAdd={undefined}
              onEdit={undefined}
              onDelete={handleDeleteStudent}
              onView={handleViewStudent}
              searchPlaceholder="Search students..."
              customActions={[{
                label: 'Assign Parent',
                action: handleAssignParent,
                variant: 'outline',
                icon: <Users className="h-4 w-4" />
              }]}
              currentPage={currentPage}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemsPerPage={itemsPerPage}
              allowAdd={false}
              allowEdit={false}
              allowDelete={true}
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <DataCardView
              data={filteredStudents}
              columns={columns}
              onView={handleViewStudent}
              onDelete={handleDeleteStudent}
              customActions={[{
                label: 'Assign Parent',
                action: handleAssignParent,
                variant: 'outline',
                icon: <Users className="h-4 w-4" />
              }]}
              allowEdit={false}
              allowDelete={true}
            />
          </div>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Student</DialogTitle>
          </DialogHeader>
          <CreateStudentForm onSubmit={handleCreateStudent} onCancel={() => setShowCreateDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Assign Parent Dialog */}
      <Dialog open={showAssignParentDialog} onOpenChange={setShowAssignParentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Parent to Student</DialogTitle>
            <DialogDescription>
              Assign a parent or guardian to {selectedStudent?.user.firstName} {selectedStudent?.user.lastName}
            </DialogDescription>
          </DialogHeader>
          <AssignParentForm onSubmit={handleAssignParentSubmit} onCancel={() => {
          setShowAssignParentDialog(false);
          setSelectedStudent(null);
        }} />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.user.imageUrl || ''} alt={selectedStudent.user.firstName} />
                  <AvatarFallback>
                    {selectedStudent.user.firstName.charAt(0)}{selectedStudent.user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedStudent.user.firstName} {selectedStudent.user.lastName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Student ID: {selectedStudent.studentId}</p>
                  <Badge variant={selectedStudent.isActive ? "default" : "secondary"}>
                    {selectedStudent.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email:</label>
                  <p className="text-sm">{selectedStudent.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone:</label>
                  <p className="text-sm">{selectedStudent.user.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender:</label>
                  <p className="text-sm">{selectedStudent.user.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Blood Group:</label>
                  <p className="text-sm">{selectedStudent.bloodGroup}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Emergency Contact:</label>
                  <p className="text-sm">{selectedStudent.emergencyContact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Medical Conditions:</label>
                  <p className="text-sm">{selectedStudent.medicalConditions || 'None'}</p>
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
