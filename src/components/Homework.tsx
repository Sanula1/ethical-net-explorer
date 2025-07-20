import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Filter } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CreateHomeworkForm from '@/components/forms/CreateHomeworkForm';
import UpdateHomeworkForm from '@/components/forms/UpdateHomeworkForm';
import { DataCardView } from '@/components/ui/data-card-view';
import { homeworkApi, type Homework, type HomeworkQueryParams } from '@/api/homework.api';

interface HomeworkProps {
  apiLevel?: 'institute' | 'class' | 'subject';
}

const Homework = ({ apiLevel = 'institute' }: HomeworkProps) => {
  const { user, selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHomeworkData, setSelectedHomeworkData] = useState<any>(null);
  const [homeworkData, setHomeworkData] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Mobile view and filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('endDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const buildQueryParams = (): HomeworkQueryParams => {
    const params: HomeworkQueryParams = {
      page: 1,
      limit: 100,
      sortBy,
      sortOrder,
      isActive: true
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

    return params;
  };

  const handleLoadData = async () => {
    setIsLoading(true);
    console.log(`Loading homework data for API level: ${apiLevel}`);
    console.log(`Current context - Institute: ${selectedInstitute?.name}, Class: ${selectedClass?.name}, Subject: ${selectedSubject?.name}`);
    
    try {
      const userRole = (user?.role || 'Student') as UserRole;
      const params = buildQueryParams();
      
      if (userRole === 'Student') {
        // For students: require all selections
        if (!currentInstituteId || !currentClassId || !currentSubjectId) {
          toast({
            title: "Missing Selection",
            description: "Please select institute, class, and subject to view homework.",
            variant: "destructive"
          });
          return;
        }
      }
      
      console.log('Fetching homework with params:', params);
      
      const result = await homeworkApi.getHomework(params);
      console.log('Homework loaded successfully:', result);
      
      // Handle both array response and paginated response
      const homework = result.data || (Array.isArray(result) ? result : []);
      setHomeworkData(homework);
      setDataLoaded(true);
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${homework.length} homework assignments.`
      });
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

  useEffect(() => {
    if (currentInstituteId) {
      handleLoadData();
    }
  }, [apiLevel, selectedInstitute, selectedClass, selectedSubject, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleCreateHomework = async () => {
    setIsCreateDialogOpen(false);
    await handleLoadData();
  };

  const handleEditHomework = async (homeworkData: any) => {
    console.log('Loading homework for editing:', homeworkData);
    setSelectedHomeworkData(homeworkData);
    setIsEditDialogOpen(true);
  };

  const handleUpdateHomework = async () => {
    setIsEditDialogOpen(false);
    setSelectedHomeworkData(null);
    await handleLoadData();
  };

  const handleDeleteHomework = async (homeworkData: any) => {
    console.log('Deleting homework:', homeworkData);
    
    try {
      setIsLoading(true);
      await homeworkApi.deleteHomework(homeworkData.id);
      
      console.log('Homework deleted successfully');
      
      toast({
        title: "Homework Deleted",
        description: `Homework ${homeworkData.title} has been deleted successfully.`,
        variant: "destructive"
      });
      
      await handleLoadData();
      
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
    { 
      key: 'startDate', 
      header: 'Start Date', 
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'Not set'
    },
    { 
      key: 'endDate', 
      header: 'End Date', 
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'Not set'
    },
    { 
      key: 'teacher', 
      header: 'Teacher',
      render: (value: any) => value ? `${value.firstName} ${value.lastName}` : 'Not assigned'
    },
    { 
      key: 'subject', 
      header: 'Subject',
      render: (value: any) => value ? `${value.name} (${value.code})` : 'Not assigned'
    },
    { 
      key: 'class', 
      header: 'Class',
      render: (value: any) => value ? `${value.name}` : 'Not assigned'
    },
    { 
      key: 'institute', 
      header: 'Institute',
      render: (value: any) => value ? `${value.name}` : 'Not assigned'
    },
    { 
      key: 'referenceLink', 
      header: 'Reference Link',
      render: (value: string) => value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          View Resource
        </a>
      ) : 'None'
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
      String(homework.isActive) === statusFilter;
    
    return matchesSearch && matchesStatus;
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
              ? 'Please select institute, class, and subject to view homework.'
              : 'Click the button below to load homework data'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
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
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="endDate">End Date</SelectItem>
                    <SelectItem value="startDate">Start Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Sort Order
                </label>
                <Select value={sortOrder} onValueChange={(value: 'ASC' | 'DESC') => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Descending</SelectItem>
                    <SelectItem value="ASC">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSortBy('endDate');
                    setSortOrder('DESC');
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
