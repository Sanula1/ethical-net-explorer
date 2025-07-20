import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Filter, Plus, Calendar, Clock, MapPin, Video, Users } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CreateLectureForm from '@/components/forms/CreateLectureForm';
import UpdateLectureForm from '@/components/forms/UpdateLectureForm';
import { DataCardView } from '@/components/ui/data-card-view';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface LecturesProps {
  apiLevel?: 'institute' | 'class' | 'subject';
}

const Lectures = ({ apiLevel = 'institute' }: LecturesProps) => {
  const { user, selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLectureData, setSelectedLectureData] = useState<any>(null);
  const [lecturesData, setLecturesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');


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

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    // Add context-aware filtering
    if (currentInstituteId) {
      params.append('instituteId', currentInstituteId);
    }

    if (currentClassId) {
      params.append('classId', currentClassId);
    }

    if (currentSubjectId) {
      params.append('subjectId', currentSubjectId);
    }

    // Add pagination
    params.append('page', '1');
    params.append('limit', '100');

    // Add filter parameters
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }

    if (statusFilter !== 'all') {
      params.append('status', statusFilter);
    }

    if (typeFilter !== 'all') {
      params.append('lectureType', typeFilter);
    }

    return params;
  };

  const buildRequestBody = (additionalData: any = {}) => {
    const body: any = { ...additionalData };

    if (currentInstituteId) {
      body.instituteId = currentInstituteId;
    }

    if (currentClassId) {
      body.classId = currentClassId;
    }

    if (currentSubjectId) {
      body.subjectId = currentSubjectId;
    }

    return body;
  };

  const handleLoadData = async () => {
    setIsLoading(true);
    console.log(`Loading lectures data for API level: ${apiLevel}`);
    console.log(`Current context - Institute: ${selectedInstitute?.name}, Class: ${selectedClass?.name}, Subject: ${selectedSubject?.name}`);
    
    try {
      const baseUrl = getBaseUrl();
      const headers = getApiHeaders();
      const userRole = (user?.role || 'Student') as UserRole;
      let url = '';
      
      if (userRole === 'Student') {
        // For students: use the new API endpoint with required parameters
        if (!currentInstituteId || !currentClassId || !currentSubjectId) {
          toast({
            title: "Missing Selection",
            description: "Please select institute, class, and subject to view lectures.",
            variant: "destructive"
          });
          return;
        }
        
        const params = buildQueryParams();
        url = `${baseUrl}/institute-class-subject-lectures?${params}`;
      } else if (userRole === 'InstituteAdmin') {
        // For InstituteAdmin: use specific API based on current selection
        const params = buildQueryParams();
        
        if (currentInstituteId && currentClassId && currentSubjectId) {
          // 4. Institute + Class + Subject selected
          url = `${baseUrl}/institute-class-subject-lectures?${params}`;
        } else if (currentInstituteId && !currentClassId && !currentSubjectId) {
          // 3. Only Institute selected
          url = `${baseUrl}/institute-class-subject-lectures?${params}`;
        } else {
          // Fallback to original API
          url = params.toString() ? `${baseUrl}/lectures?${params}` : `${baseUrl}/lectures`;
        }
      } else {
        // For other roles: use the original API
        const params = buildQueryParams();
        url = params.toString() ? `${baseUrl}/lectures?${params}` : `${baseUrl}/lectures`;
      }
      
      console.log('Fetching lectures from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lectures data');
      }

      const result = await response.json();
      console.log('Lectures loaded successfully:', result);
      
      // Handle both array response and paginated response
      const lectures = result.data || (Array.isArray(result) ? result : []);
      setLecturesData(lectures);
      setDataLoaded(true);
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${lectures.length} lectures.`
      });
    } catch (error) {
      console.error('Failed to load lectures:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load lectures data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentInstituteId) {
      handleLoadData();
    }
  }, [apiLevel, selectedInstitute, selectedClass, selectedSubject, searchTerm, statusFilter, typeFilter]);

  const handleCreateLecture = async () => {
    // This function is called when create form is successful
    setIsCreateDialogOpen(false);
    await handleLoadData();
  };

  const handleEditLecture = async (lectureData: any) => {
    console.log('Loading lecture for editing:', lectureData);
    setSelectedLectureData(lectureData);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLecture = async () => {
    // This function is called when update form is successful
    setIsEditDialogOpen(false);
    setSelectedLectureData(null);
    await handleLoadData();
  };

  const handleDeleteLecture = async (lectureData: any) => {
    console.log('Deleting lecture:', lectureData);
    
    try {
      setIsLoading(true);
      const baseUrl = getBaseUrl();
      const headers = getApiHeaders();
      
      const response = await fetch(`${baseUrl}/lectures/${lectureData.id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete lecture');
      }

      console.log('Lecture deleted successfully');
      
      toast({
        title: "Lecture Deleted",
        description: `Lecture ${lectureData.title} has been deleted successfully.`,
        variant: "destructive"
      });
      
      await handleLoadData();
      
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete lecture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLecture = (lectureData: any) => {
    console.log('View lecture:', lectureData);
    toast({
      title: "Lecture Viewed",
      description: `Viewing lecture: ${lectureData.title}`
    });
  };

  const lecturesColumns = [
    { key: 'title', header: 'Title' },
    { key: 'description', header: 'Description' },
    { key: 'lectureType', header: 'Type', render: (value: string) => <Badge variant="outline">{value}</Badge> },
    { key: 'venue', header: 'Venue' },
    { key: 'startTime', header: 'Start Time', render: (value: string) => new Date(value).toLocaleString() },
    { key: 'endTime', header: 'End Time', render: (value: string) => new Date(value).toLocaleString() },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'scheduled' ? 'default' : value === 'completed' ? 'secondary' : 'destructive'}>
          {value}
        </Badge>
      )
    }
  ];

  const userRole = (user?.role || 'Student') as UserRole;
  const canAdd = AccessControl.hasPermission(userRole, 'create-lecture');
  const canEdit = AccessControl.hasPermission(userRole, 'edit-lecture');
  const canDelete = AccessControl.hasPermission(userRole, 'delete-lecture');

  const getTitle = () => {
    const contexts = [];
    
    if (selectedInstitute) {
      contexts.push(selectedInstitute.name);
    }
    
    if (selectedClass) {
      contexts.push(selectedClass.name);
    }
    
    if (selectedSubject) {
      contexts.push(selectedSubject.name);
    }
    
    let title = 'Lectures';
    if (contexts.length > 0) {
      title += ` (${contexts.join(' → ')})`;
    }
    
    return title;
  };

  // Filter the lectures based on local filters for mobile view
  const filteredLectures = lecturesData.filter(lecture => {
    const matchesSearch = !searchTerm || 
      Object.values(lecture).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || 
      lecture.status === statusFilter;
    
    const matchesType = typeFilter === 'all' || 
      lecture.lectureType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {!dataLoaded ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {getTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {userRole === 'Student' && (!currentInstituteId || !currentClassId || !currentSubjectId)
              ? 'Please select institute, class, and subject to view lectures.'
              : 'Click the button below to load lectures data'
            }
          </p>
          <Button 
            onClick={handleLoadData} 
            disabled={isLoading || (userRole === 'Student' && (!currentInstituteId || !currentClassId || !currentSubjectId))}
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
                Load Data
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {getTitle()}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button 
                onClick={handleLoadData} 
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
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Search Lectures
                </label>
                <Input
                  placeholder="Search lectures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Type
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <DataTable
              title=""
              data={lecturesData}
              columns={lecturesColumns}
              onAdd={canAdd ? () => setIsCreateDialogOpen(true) : undefined}
              onEdit={canEdit ? handleEditLecture : undefined}
              onDelete={canDelete ? handleDeleteLecture : undefined}
              onView={handleViewLecture}
              searchPlaceholder="Search lectures..."
            />
          </div>

          {/* Mobile Card View - Always show cards */}
          <div className="md:hidden">
            <DataCardView
              data={filteredLectures}
              columns={lecturesColumns}
              onView={handleViewLecture}
              onEdit={canEdit ? handleEditLecture : undefined}
              onDelete={canDelete ? handleDeleteLecture : undefined}
              allowEdit={canEdit}
              allowDelete={canDelete}
            />
          </div>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Lecture</DialogTitle>
          </DialogHeader>
          <CreateLectureForm
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={handleCreateLecture}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lecture</DialogTitle>
          </DialogHeader>
          <UpdateLectureForm
            lecture={selectedLectureData}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedLectureData(null);
            }}
            onSuccess={handleUpdateLecture}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lectures;
