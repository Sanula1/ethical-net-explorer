import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataCardView } from '@/components/ui/data-card-view';
import { RefreshCw, ExternalLink, Play, Search, Filter, Clock, MapPin, Users, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import CreateExamForm from '@/components/forms/CreateExamForm';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface Exam {
  id: string;
  instituteId: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  examType: 'online' | 'physical';
  durationMinutes: number;
  totalMarks: string;
  passingMarks: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  examLink?: string;
  instructions: string;
  status: 'scheduled' | 'draft' | 'completed' | 'cancelled';
  createdBy: string | null;
  toWhom: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  institute: any;
  class: any;
  subject: any;
  creator: any;
}

const Exams = () => {
  const { selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId, user } = useAuth();
  const { toast } = useToast();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Dialog states
  const [examFormUrl, setExamFormUrl] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

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

  const loadExamsData = async () => {
    if (!currentInstituteId) {
      toast({
        title: "No Institute Selected",
        description: "Please select an institute first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Loading exams data...');
    console.log(`Current context - Institute: ${selectedInstitute?.name}, Class: ${selectedClass?.name}, Subject: ${selectedSubject?.name}`);
    
    try {
      const baseUrl = getBaseUrl();
      const headers = getApiHeaders();
      
      let url: string;

      // Determine which API endpoint to use based on selection context
      if (currentInstituteId && currentClassId && currentSubjectId) {
        // Use institute-class-subject-exams endpoint with additional filters
        url = `${baseUrl}/institute-class-subject-exams/institute/${currentInstituteId}?page=1&limit=10&classId=${currentClassId}&subjectId=${currentSubjectId}&isActive=true`;
        console.log('Using institute-class-subject-exams endpoint with class and subject filters');
      } else if (currentInstituteId) {
        // Use institute-class-subject-exams endpoint for institute only
        url = `${baseUrl}/institute-class-subject-exams/institute/${currentInstituteId}?page=1&limit=10`;
        console.log('Using institute-class-subject-exams endpoint for institute only');
      } else {
        throw new Error('No valid context for loading exams');
      }

      console.log('API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch exams data: ${response.status}`);
      }

      const result = await response.json();
      console.log('Exams loaded successfully:', result);
      
      // Handle both array response and paginated response
      const examsData = result.data || result;
      setExams(examsData);
      setFilteredExams(examsData);
      setDataLoaded(true);
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${examsData.length} exams.`
      });
    } catch (error) {
      console.error('Failed to load exams:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load exams data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExam = async (exam: Exam) => {
    setExamToDelete(exam);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;

    setIsLoading(true);
    try {
      const baseUrl = getBaseUrl();
      const headers = getApiHeaders();
      
      const response = await fetch(`${baseUrl}/institute-class-subject-exams/${examToDelete.id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to delete exam');
      }

      toast({
        title: "Exam Deleted",
        description: `Exam "${examToDelete.title}" has been deleted successfully.`,
        variant: "destructive"
      });

      setIsDeleteDialogOpen(false);
      setExamToDelete(null);
      await loadExamsData();
      
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete exam. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsEditDialogOpen(true);
  };

  const handleFormSuccess = () => {
    loadExamsData();
  };

  // Apply filters to exams
  useEffect(() => {
    let filtered = exams;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.venue.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(exam => exam.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(exam => exam.examType === typeFilter);
    }

    setFilteredExams(filtered);
  }, [exams, searchTerm, statusFilter, typeFilter]);

  // Load data when context changes
  useEffect(() => {
    if (currentInstituteId) {
      loadExamsData();
    }
  }, [currentInstituteId, currentClassId, currentSubjectId]);

  const handleStartExam = (exam: Exam) => {
    if (exam.examType === 'online' && exam.examLink) {
      setExamFormUrl(exam.examLink);
      setIsFormDialogOpen(true);
      console.log('Starting online exam:', exam.title);
    } else {
      toast({
        title: "Physical Exam",
        description: "This is a physical exam. Please attend the scheduled session.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

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
    
    let title = 'Exams Management';
    if (contexts.length > 0) {
      title += ` (${contexts.join(' → ')})`;
    }
    
    return title;
  };

  const tableColumns = [
    {
      key: 'title',
      header: 'Title',
      render: (value: any, row: Exam) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      key: 'examType',
      header: 'Type',
      render: (value: any) => (
        <Badge variant={value === 'online' ? 'default' : 'secondary'}>
          {value === 'online' ? (
            <>
              <ExternalLink className="h-3 w-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <MapPin className="h-3 w-3 mr-1" />
              Physical
            </>
          )}
        </Badge>
      )
    },
    {
      key: 'durationMinutes',
      header: 'Duration',
      render: (value: any) => formatDuration(value)
    },
    {
      key: 'totalMarks',
      header: 'Marks',
      render: (value: any, row: Exam) => `${value}/${row.passingMarks}`
    },
    {
      key: 'venue',
      header: 'Venue',
      render: (value: any) => value || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: any) => (
        <Badge className={getStatusColor(value)}>
          {value.toUpperCase()}
        </Badge>
      )
    }
  ];

  const userRole = (user?.role || 'Student') as UserRole;
  const canAdd = AccessControl.hasPermission(userRole, 'create-exam');
  const canEdit = AccessControl.hasPermission(userRole, 'edit-exam');
  const canDelete = AccessControl.hasPermission(userRole, 'delete-exam');

  const customActions = [
    {
      label: 'Start',
      action: (exam: Exam) => handleStartExam(exam),
      icon: <Play className="h-3 w-3" />,
      variant: 'default' as const
    }
  ];

  if (!dataLoaded) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="text-center py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
            Click the button below to load exams data
          </p>
          <Button 
            onClick={loadExamsData} 
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
                Load Exams Data
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {getTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Create and manage online and physical exams
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canAdd && (
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
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
            onClick={loadExamsData} 
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

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exams..."
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredExams.length} of {exams.length} exams
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile View Content - Always Card View */}
      <div className="md:hidden">
        <DataCardView
          data={filteredExams}
          columns={tableColumns}
          onEdit={canEdit ? handleEditExam : undefined}
          onDelete={canDelete ? handleDeleteExam : undefined}
          customActions={customActions}
          allowEdit={canEdit}
          allowDelete={canDelete}
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 sm:py-12">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No exams found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                          ? 'Try adjusting your filters to see more results.'
                          : 'No exams are available for the current selection.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exam.title}</div>
                          <div className="text-sm text-gray-500">{exam.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={exam.examType === 'online' ? 'default' : 'secondary'}>
                          {exam.examType}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDuration(exam.durationMinutes)}</TableCell>
                      <TableCell>{exam.totalMarks}/{exam.passingMarks}</TableCell>
                      <TableCell>{exam.venue}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {exam.status === 'scheduled' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStartExam(exam)}
                            >
                              {exam.examType === 'online' ? 'Start' : 'View'}
                            </Button>
                          )}
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditExam(exam)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExam(exam)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Online Exam Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Online Exam
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(examFormUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[70vh]">
            <iframe
              src={examFormUrl}
              className="w-full h-full border-0 rounded-lg"
              title="Online Exam"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Exam Dialog */}
      {isCreateDialogOpen && (
        <CreateExamForm
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Edit Exam Dialog */}
      {isEditDialogOpen && selectedExam && (
        <CreateExamForm
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedExam(null);
          }}
          onSuccess={handleFormSuccess}
          initialData={selectedExam}
          isEdit={true}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the exam "{examToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteExam} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Exams;
