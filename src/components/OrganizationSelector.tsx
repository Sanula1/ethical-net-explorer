
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Search, Plus, LayoutGrid, List, LogOut } from 'lucide-react';
import { organizationSpecificApi, Organization } from '@/api/organization.api';
import { useToast } from '@/hooks/use-toast';
import CreateOrganizationForm from '@/components/forms/CreateOrganizationForm';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface OrganizationSelectorProps {
  onLogout: () => void;
}

const OrganizationSelector = ({ onLogout }: OrganizationSelectorProps) => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrganizations, setTotalOrganizations] = useState(0);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await organizationSpecificApi.get('/organization/api/v1/organizations', params);
      setOrganizations(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalOrganizations(response.pagination.total);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch organizations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [currentPage, searchTerm]);

  const handleCreateSuccess = (newOrganization: Organization) => {
    setIsCreateDialogOpen(false);
    fetchOrganizations(); // Refresh the list
    toast({
      title: 'Success',
      description: 'Organization created successfully',
    });
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

        <div className="pt-2">
          <Button
            onClick={() => console.log('Select organization:', org.organizationId)}
            className="w-full"
          >
            Select Organization
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Select Organization</h1>
          <p className="text-muted-foreground">
            Choose an organization to manage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
              </DialogHeader>
              <CreateOrganizationForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Search and View Mode */}
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
                      <TableHead>Actions</TableHead>
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
                        <TableCell>
                          <Button
                            onClick={() => console.log('Select organization:', org.organizationId)}
                            size="sm"
                          >
                            Select
                          </Button>
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
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                      : 'Get started by adding your first organization'
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
};

export default OrganizationSelector;
