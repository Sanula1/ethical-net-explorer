
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Plus, Search, LayoutGrid, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface Organization {
  organizationId: string;
  name: string;
  type: 'INSTITUTE' | 'GLOBAL';
  isPublic: boolean;
  instituteId: string | null;
}

interface OrganizationResponse {
  data: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    sortBy: string;
    sortOrder: string;
  };
}

interface OrganizationManagerDashboardProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const OrganizationManagerDashboard = ({ currentPage, onPageChange }: OrganizationManagerDashboardProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrganizations, setTotalOrganizations] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (currentPage === 'select-organizations') {
      loadOrganizations();
    }
  }, [currentPage, currentPageNum, searchTerm]);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('org_access_token');
      const queryParams = new URLSearchParams({
        page: currentPageNum.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`http://localhost:3001/organization/api/v1/organizations?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load organizations');
      }

      const data: OrganizationResponse = await response.json();
      setOrganizations(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalOrganizations(data.pagination.total);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async (formData: any) => {
    try {
      const token = localStorage.getItem('org_access_token');
      const response = await fetch('http://localhost:3001/organization/api/v1/organizations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create organization');
      }

      const data = await response.json();
      setOrganizations(prev => [data, ...prev]);
      setShowCreateForm(false);
      
      toast({
        title: "Success",
        description: "Organization created successfully",
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      });
    }
  };

  const renderContent = () => {
    if (currentPage === 'select-organizations') {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Organizations</h1>
              <p className="text-muted-foreground">
                Manage your organizations and their details
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <CreateOrganizationForm 
              onSubmit={handleCreateOrganization}
              onCancel={() => setShowCreateForm(false)}
            />
          )}

          {/* Search and View Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'card' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('card')}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Content */}
          {!isLoading && (
            <>
              {viewMode === 'card' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {organizations.map((org) => (
                    <OrganizationCard key={org.organizationId} org={org} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Organizations List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Visibility</TableHead>
                          <TableHead>Institute ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {organizations.map((org) => (
                          <TableRow key={org.organizationId}>
                            <TableCell>
                              <div className="font-medium">{org.name}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{org.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={org.isPublic ? 'default' : 'secondary'}>
                                {org.isPublic ? 'Public' : 'Private'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {org.instituteId ? (
                                <Badge variant="outline" className="text-xs">
                                  {org.instituteId}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {organizations.length} of {totalOrganizations} organizations
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                          className={currentPageNum === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPageNum(page)}
                              isActive={currentPageNum === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                          className={currentPageNum === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              {organizations.length === 0 && !isLoading && (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No organizations found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm
                          ? 'Try adjusting your search terms'
                          : 'Get started by creating your first organization'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

const OrganizationCard = ({ org }: { org: Organization }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">{org.name}</CardTitle>
            <Badge variant="outline" className="mt-1">
              {org.type}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Badge variant={org.isPublic ? 'default' : 'secondary'}>
            {org.isPublic ? 'Public' : 'Private'}
          </Badge>
          {org.instituteId && (
            <Badge variant="outline" className="text-xs">
              {org.instituteId}
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Type:</span>
          <span className="text-muted-foreground">{org.type}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium">Visibility:</span>
          <span className="text-muted-foreground">
            {org.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
        {org.instituteId && (
          <div className="flex items-center space-x-2">
            <span className="font-medium">Institute:</span>
            <span className="text-muted-foreground">{org.instituteId}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const CreateOrganizationForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'INSTITUTE' as 'INSTITUTE' | 'GLOBAL',
    isPublic: true,
    enrollmentKey: '',
    instituteId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      name: formData.name,
      type: formData.type,
      isPublic: formData.isPublic,
      ...(formData.enrollmentKey && { enrollmentKey: formData.enrollmentKey }),
      ...(formData.instituteId && { instituteId: formData.instituteId })
    };
    
    onSubmit(submitData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value: 'INSTITUTE' | 'GLOBAL') => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSTITUTE">Institute</SelectItem>
                <SelectItem value="GLOBAL">Global</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="instituteId">Institute ID (optional)</Label>
            <Input
              id="instituteId"
              value={formData.instituteId}
              onChange={(e) => setFormData(prev => ({ ...prev, instituteId: e.target.value }))}
              placeholder="Enter institute ID"
            />
          </div>

          <div>
            <Label htmlFor="enrollmentKey">Enrollment Key (optional)</Label>
            <Input
              id="enrollmentKey"
              value={formData.enrollmentKey}
              onChange={(e) => setFormData(prev => ({ ...prev, enrollmentKey: e.target.value }))}
              placeholder="Enter enrollment key"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            />
            <Label htmlFor="isPublic">Public Organization</Label>
          </div>

          <div className="flex space-x-2">
            <Button type="submit">Create Organization</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrganizationManagerDashboard;
