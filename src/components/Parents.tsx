import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { DataCardView } from '@/components/ui/data-card-view';
import { RefreshCw, Filter, Eye, Edit, Trash2, UserCheck } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CreateParentForm from '@/components/forms/CreateParentForm';
import { getBaseUrl } from '@/contexts/utils/auth.api';

const mockParents = [
  {
    id: '1',
    parentId: 'PAR001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    relationship: 'Father',
    children: 'Alice Smith',
    address: '123 Main St, Anytown',
    occupation: 'Engineer',
    income: '$80,000',
    educationLevel: 'Bachelor\'s Degree',
    status: 'Active'
  },
  {
    id: '2',
    parentId: 'PAR002',
    name: 'Emily Johnson',
    email: 'emily.johnson@example.com',
    phone: '+1 (555) 987-6543',
    relationship: 'Mother',
    children: 'Bob Johnson',
    address: '456 Oak Ave, Anytown',
    occupation: 'Teacher',
    income: '$60,000',
    educationLevel: 'Master\'s Degree',
    status: 'Active'
  },
  {
    id: '3',
    parentId: 'PAR003',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    phone: '+1 (555) 456-7890',
    relationship: 'Guardian',
    children: 'Charlie Brown',
    address: '789 Pine Ln, Anytown',
    occupation: 'Accountant',
    income: '$70,000',
    educationLevel: 'Associate\'s Degree',
    status: 'Inactive'
  }
];

const Parents = () => {
  const { user, selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [parentsData, setParentsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [relationshipFilter, setRelationshipFilter] = useState('all');

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
    console.log('Loading parents data...');
    console.log(`Current context - Institute: ${selectedInstitute?.name}, Class: ${selectedClass?.name}, Subject: ${selectedSubject?.name}`);
    
    try {
      const baseUrl = getBaseUrl();
      const headers = getApiHeaders();
      const params = buildQueryParams();
      
      // For now, simulate API call with mock data but in real scenario would be:
      // const url = params.toString() ? `${baseUrl}/parents?${params}` : `${baseUrl}/parents`;
      // const response = await fetch(url, { method: 'GET', headers });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data based on filters
      let filteredData = mockParents;
      
      if (searchTerm) {
        filteredData = filteredData.filter(parent =>
          parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parent.relationship.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(parent => parent.status === statusFilter);
      }
      
      if (relationshipFilter !== 'all') {
        filteredData = filteredData.filter(parent =>
          parent.relationship.toLowerCase().includes(relationshipFilter.toLowerCase())
        );
      }
      
      setParentsData(filteredData);
      setDataLoaded(true);
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${filteredData.length} parents.`
      });
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "Failed to load parents data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Define columns for mobile table/card view
  const parentsColumns = [
    { key: 'parentId', header: 'Parent ID' },
    { key: 'name', header: 'Full Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'relationship', header: 'Relationship' },
    { key: 'children', header: 'Children' },
    { key: 'address', header: 'Address' },
    { key: 'occupation', header: 'Occupation' },
    { key: 'income', header: 'Income' },
    { key: 'educationLevel', header: 'Education Level' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: any) => (
        <Badge variant={
          value === 'Active' ? 'default' : 
          value === 'Inactive' ? 'secondary' : 
          'destructive'
        }>
          {value}
        </Badge>
      )
    }
  ];

  const handleAddParent = () => {
    console.log('Add new parent');
  };

  const handleEditParent = (parent: any) => {
    console.log('Edit parent:', parent);
    setSelectedParent(parent);
    setIsEditDialogOpen(true);
  };

  const handleUpdateParent = (parentData: any) => {
    console.log('Updating parent:', parentData);
    
    // In real scenario, would include context in request body:
    // const requestBody = buildRequestBody(parentData);
    
    toast({
      title: "Parent Updated",
      description: `Parent ${parentData.name} has been updated successfully.`
    });
    setIsEditDialogOpen(false);
    setSelectedParent(null);
  };

  const handleDeleteParent = (parent: any) => {
    console.log('Delete parent:', parent);
    toast({
      title: "Parent Deleted",
      description: `Parent ${parent.name} has been deleted.`,
      variant: "destructive"
    });
  };

  const handleViewParent = (parent: any) => {
    console.log('View parent details:', parent);
    toast({
      title: "View Parent",
      description: `Viewing parent: ${parent.name}`
    });
  };

  const handleCreateParent = (parentData: any) => {
    console.log('Creating parent:', parentData);
    
    // In real scenario, would include context in request body:
    // const requestBody = buildRequestBody(parentData);
    
    toast({
      title: "Parent Created",
      description: `Parent ${parentData.name} has been created successfully.`
    });
    setIsCreateDialogOpen(false);
  };

  const userRole = (user?.role || 'Student') as UserRole;
  const canAdd = AccessControl.hasPermission(userRole, 'create-parent');
  const canEdit = AccessControl.hasPermission(userRole, 'edit-parent');
  const canDelete = AccessControl.hasPermission(userRole, 'delete-parent');

  const getContextTitle = () => {
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
    
    let title = 'Parents & Guardians Management';
    if (contexts.length > 0) {
      title += ` (${contexts.join(' → ')})`;
    }
    
    return title;
  };

  const customActions = [
    {
      label: 'View',
      action: (parent: any) => handleViewParent(parent),
      icon: <Eye className="h-3 w-3" />,
      variant: 'outline' as const
    },
    ...(canEdit ? [{
      label: 'Edit',
      action: (parent: any) => handleEditParent(parent),
      icon: <Edit className="h-3 w-3" />,
      variant: 'outline' as const
    }] : []),
    ...(canDelete ? [{
      label: 'Delete',
      action: (parent: any) => handleDeleteParent(parent),
      icon: <Trash2 className="h-3 w-3" />,
      variant: 'destructive' as const
    }] : [])
  ];

  return (
    <div className="space-y-6">
      {!dataLoaded ? (
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getContextTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load parents data
          </p>
          <Button 
            onClick={handleLoadData} 
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
                Load Data
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {getContextTitle()}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage parent and guardian information, communication preferences
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
            
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

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Search Parents
                </label>
                <Input
                  placeholder="Search parents..."
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Relationship
                </label>
                <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Relationships</SelectItem>
                    <SelectItem value="Father">Father</SelectItem>
                    <SelectItem value="Mother">Mother</SelectItem>
                    <SelectItem value="Guardian">Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Mobile View Content - Always Card View */}
          <div className="md:hidden">
            <DataCardView
              data={parentsData}
              columns={parentsColumns}
              customActions={customActions}
              allowEdit={false}
              allowDelete={false}
            />
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <DataTable
              title="Parents & Guardians"
              data={parentsData}
              columns={parentsColumns}
              onAdd={canAdd ? () => setIsCreateDialogOpen(true) : undefined}
              onEdit={canEdit ? handleEditParent : undefined}
              onDelete={canDelete ? handleDeleteParent : undefined}
              onView={handleViewParent}
              searchPlaceholder="Search parents..."
              allowAdd={canAdd}
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
            <DialogTitle>Create New Parent</DialogTitle>
          </DialogHeader>
          <CreateParentForm
            onSubmit={handleCreateParent}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Parent</DialogTitle>
          </DialogHeader>
          <CreateParentForm
            initialData={selectedParent}
            onSubmit={handleUpdateParent}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedParent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Parents;
