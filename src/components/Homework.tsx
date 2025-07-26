import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Filter, Plus, Calendar, Clock, FileText, CheckCircle } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CreateHomeworkForm from '@/components/forms/CreateHomeworkForm';
import UpdateHomeworkForm from '@/components/forms/UpdateHomeworkForm';
import { DataCardView } from '@/components/ui/data-card-view';
import { cachedApiClient } from '@/api/cachedClient';

interface HomeworkProps {
  apiLevel?: 'institute' | 'class' | 'subject';
}

const Homework = ({ apiLevel = 'institute' }: HomeworkProps) => {
  const { user, selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHomeworkData, setSelectedHomeworkData] = useState<any>(null);
  const [homeworkData, setHomeworkData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const buildQueryParams = () => {
    const params: Record<string, any> = {
      page: 1,
      limit: 100
    };

    // Add context-aware filtering
    if (currentInstituteId) {
      params.instituteId = currentInstituteId;
    }

    if (currentClassId) {
      params.classId = currentClassId;
    }

    if (currentSubjectId) {
      params.subjectId = currentSubjectId;
    }

    // Add filter parameters
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (priorityFilter !== 'all') {
      params.priority = priorityFilter;
    }

    return params;
  };

  const handleLoadData = async (forceRefresh = false) => {
    if (!currentInstituteId) return;

    const endpoint = '/homework';
    const params = buildQueryParams();
    
    // Check if data exists in cache (only if not forcing refresh)
    if (!forceRefresh && cachedApiClient.hasCache(endpoint, params)) {
      console.log('Data already exists in cache, skipping API call');
      return;
    }

    setIsLoading(true);
    console.log(`Loading homework data for API level: ${apiLevel}`, { forceRefresh });
    
    try {
      const result = await cachedApiClient.get(endpoint, params, { 
        forceRefresh,
        ttl: 15 // Cache homework for 15 minutes
      });

      console.log('Homework loaded successfully:', result);
      
      // Handle both array response and paginated response
      const homework = Array.isArray(result) ? result : (result as any)?.data || [];
      setHomeworkData(homework);
      setDataLoaded(true);
      setLastRefresh(new Date());
      
      if (forceRefresh) {
        toast({
          title: "Data Refreshed",
          description: `Successfully refreshed ${homework.length} homework items.`
        });
      }
    } catch (error) {
      console.error('Failed to load homework:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load homework data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    console.log('Force refreshing homework data...');
    await handleLoadData(true);
  };

  // Load data only when component mounts or context changes, but don't force refresh
  useEffect(() => {
    if (currentInstituteId) {
      handleLoadData(false); // Never force refresh on navigation
    }
  }, [apiLevel, selectedInstitute, selectedClass, selectedSubject]);

  // Load data when filters change (without refresh)
  useEffect(() => {
    if (currentInstituteId && dataLoaded) {
      handleLoadData(false);
    }
  }, [searchTerm, statusFilter, priorityFilter]);

  const handleCreateHomework = async () => {
    setIsCreateDialogOpen(false);
    // Force refresh after creating new homework
    await handleLoadData(true);
  };

  const handleEditHomework = async (homeworkData: any) => {
    console.log('Loading homework for editing:', homeworkData);
    setSelectedHomeworkData(homeworkData);
    setIsEditDialogOpen(true);
  };

  const handleUpdateHomework = async () => {
    setIsEditDialogOpen(false);
    setSelectedHomeworkData(null);
    // Force refresh after updating homework
    await handleLoadData(true);
  };

  const handleDeleteHomework = async (homeworkData: any) => {
    console.log('Deleting homework:', homeworkData);
    
    try {
      setIsLoading(true);
      
      // Use cached client for delete (will clear related cache)
      await cachedApiClient.delete(`/homework/${homeworkData.id}`);

      console.log('Homework deleted successfully');
      
      toast({
        title: "Homework Deleted",
        description: `Homework ${homeworkData.title} has been deleted successfully.`,
        variant: "destructive"
      });
      
      // Force refresh after deletion
      await handleLoadData(true);
      
    } catch (error) {
      console.error('Error deleting homework:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete homework. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHomework = (homeworkData: any) => {
    console.log('View homework:', homeworkData);
    toast({
      title: "Homework Viewed",
      description: `Viewing homework: ${homeworkData.title}`
    });
  };

  const homeworkColumns = [
    { key: 'title', header: 'Title' },
    { key: 'description', header: 'Description' },
    { key: 'priority', header: 'Priority', render: (value: string) => <Badge variant="outline">{value}</Badge> },
    { key: 'dueDate', header: 'Due Date', render: (value: string) => new Date(value).toLocaleDateString() },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'assigned' ? 'default' : value === 'submitted' ? 'secondary' : 'destructive'}>
          {value}
        </Badge>
      )
    }
  ];

  const userRole = (user?.role || 'Student') as UserRole;
  const canAdd = AccessControl.hasPermission(userRole, 'create-homework');
  const canEdit = AccessControl.hasPermission(userRole, 'edit-homework');
  const canDelete = AccessControl.hasPermission(userRole, 'delete-homework');

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
    
    let title = 'Homework';
    if (contexts.length > 0) {
      title += ` (${contexts.join(' → ')})`;
    }
    
    return title;
  };

  // Filter the homework based on local filters for mobile view
  const filteredHomework = homeworkData.filter(homework => {
    const matchesSearch = !searchTerm || 
      Object.values(homework).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || 
      homework.status === statusFilter;
    
    const matchesPriority = priorityFilter === 'all' || 
      homework.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {!dataLoaded ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {getTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {!currentInstituteId
              ? 'Please select institute to view homework.'
              : 'Click the button below to load homework data'
            }
          </p>
          <Button 
            onClick={() => handleLoadData(false)} 
            disabled={isLoading || !currentInstituteId}
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getTitle()}
              </h1>
              {lastRefresh && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Last refreshed: {lastRefresh.toLocaleTimeString()}
                </p>
              )}
            </div>
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
                onClick={handleRefreshData} 
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
                  Search Homework
                </label>
                <Input
                  placeholder="Search homework..."
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
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Priority
                </label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
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
              data={homeworkData}
              columns={homeworkColumns}
              onAdd={canAdd ? () => setIsCreateDialogOpen(true) : undefined}
              onEdit={canEdit ? handleEditHomework : undefined}
              onDelete={canDelete ? handleDeleteHomework : undefined}
              onView={handleViewHomework}
              searchPlaceholder="Search homework..."
            />
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <DataCardView
              data={filteredHomework}
              columns={homeworkColumns}
              onView={handleViewHomework}
              onEdit={canEdit ? handleEditHomework : undefined}
              onDelete={canDelete ? handleDeleteHomework : undefined}
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
            <DialogTitle>Create New Homework</DialogTitle>
          </DialogHeader>
          <CreateHomeworkForm
            onClose={() => setIsCreateDialogOpen(false)}
            onSuccess={handleCreateHomework}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Homework</DialogTitle>
          </DialogHeader>
          <UpdateHomeworkForm
            homework={selectedHomeworkData}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedHomeworkData(null);
            }}
            onSuccess={handleUpdateHomework}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Homework;
