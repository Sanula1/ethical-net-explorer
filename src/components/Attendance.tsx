
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, Filter, Calendar, User, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InstituteAttendanceRecord {
  user_id: string;
  location: string;
  status: 'present' | 'absent' | 'late';
  timestamp: string;
  device_type: string;
  institute_id: string;
  marker_id: string;
}

interface InstituteAttendanceResponse {
  success: boolean;
  data: {
    total: number;
    byStudent: Record<string, InstituteAttendanceRecord[]>;
    records: InstituteAttendanceRecord[];
  };
  timestamp: string;
}

const Attendance = () => {
  const { selectedInstitute, currentInstituteId, user } = useAuth();
  const { toast } = useToast();
  
  const [attendanceRecords, setAttendanceRecords] = useState<InstituteAttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<InstituteAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Enhanced filter states for AttendanceMarker
  const [searchTerm, setSearchTerm] = useState('');
  const [studentId, setStudentId] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('2024-07-01');
  const [endDate, setEndDate] = useState('2025-07-31');
  const [markedById, setMarkedById] = useState('');
  const [sortOrder, setSortOrder] = useState<string>('descending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Check if user has permission to view attendance
  const hasPermission = user?.role === 'InstituteAdmin' || user?.role === 'AttendanceMarker';
  const isAttendanceMarker = user?.role === 'AttendanceMarker';

  const getAttendanceBaseUrl = () => {
    return 'https://azs5u6og5yxz2vwseaqn7uq3ua0ufpla.lambda-url.us-east-1.on.aws';
  };

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const loadAttendanceData = async () => {
    if (!currentInstituteId || !hasPermission) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view attendance records.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Loading institute attendance data from AWS Lambda...');
    
    try {
      const baseUrl = getAttendanceBaseUrl();
      const headers = getApiHeaders();
      
      const requestBody = {
        action: "getInstituteAttendance",
        instituteId: currentInstituteId,
        filters: {
          startDate,
          endDate,
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(studentId && { studentId }),
          ...(markedById && { markerId: markedById }),
          limit: 100
        }
      };

      console.log('API Request to AWS Lambda:', requestBody);
      
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch attendance data: ${response.status}`);
      }

      const result: InstituteAttendanceResponse = await response.json();
      console.log('AWS Lambda attendance data loaded successfully:', result);
      
      if (result.success) {
        setAttendanceRecords(result.data.records);
        setFilteredRecords(result.data.records);
        setTotalRecords(result.data.total);
        setDataLoaded(true);
        
        toast({
          title: "Data Loaded",
          description: `Successfully loaded ${result.data.records.length} attendance records.`
        });
      } else {
        throw new Error('Failed to load attendance data');
      }
    } catch (error) {
      console.error('Failed to load attendance from AWS Lambda:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load attendance data from server.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = attendanceRecords;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply student ID filter
    if (studentId) {
      filtered = filtered.filter(record =>
        record.user_id.toLowerCase().includes(studentId.toLowerCase())
      );
    }

    // Apply marked by ID filter
    if (markedById) {
      filtered = filtered.filter(record =>
        record.marker_id.toLowerCase().includes(markedById.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === 'ascending' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

    setFilteredRecords(filtered);
  }, [attendanceRecords, searchTerm, studentId, markedById, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTitle = () => {
    let title = 'Attendance Records';
    if (selectedInstitute) {
      title += ` (${selectedInstitute.name})`;
    }
    return title;
  };

  // Mobile Card Component
  const AttendanceCard = ({ record }: { record: InstituteAttendanceRecord }) => (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Student ID: {record.user_id}
          </CardTitle>
          <Badge className={getStatusColor(record.status)}>
            {record.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span>Location: {record.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span>Type: {record.device_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Marked By: {record.marker_id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-gray-500">
              {new Date(record.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to view attendance records. This feature is only available for Institute Admins and Attendance Markers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            View and manage student attendance records
          </p>
          <Button 
            onClick={loadAttendanceData} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Data...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Attendance Data
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage student attendance records
          </p>
        </div>
        <Button 
          onClick={loadAttendanceData} 
          disabled={isLoading}
          variant="outline"
          size="sm"
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

      {/* Enhanced Filters for AttendanceMarker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Student ID */}
            <Input
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="android">Android</SelectItem>
                <SelectItem value="ios">iOS</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
              </SelectContent>
            </Select>

            {/* Start Date */}
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            {/* End Date */}
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            {/* Marked By ID */}
            <Input
              placeholder="Marked By ID"
              value={markedById}
              onChange={(e) => setMarkedById(e.target.value)}
            />

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="descending">Descending</SelectItem>
                <SelectItem value="ascending">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredRecords.length} of {totalRecords} records (Page 1 of 1)
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Marked By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No attendance records found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        No attendance records are available for the current selection.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{record.user_id}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.device_type}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{record.marker_id}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No attendance records found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No attendance records are available for the current selection.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => (
              <AttendanceCard key={index} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
