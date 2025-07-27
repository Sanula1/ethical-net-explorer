
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationApi, type Cause, type CauseCreateData, type CausesResponse } from '@/api/organization.api';

const OrganizationCauses = () => {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    isPublic: undefined as boolean | undefined,
    organizationId: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCauses();
  }, [currentPage, searchTerm, filters]);

  const loadCauses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.isPublic !== undefined && { isPublic: filters.isPublic }),
        ...(filters.organizationId && { organizationId: filters.organizationId })
      };

      const response = await organizationApi.getCauses(params);
      setCauses(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading causes:', error);
      toast({
        title: "Error",
        description: "Failed to load causes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCause = async (data: CauseCreateData) => {
    try {
      const newCause = await organizationApi.createCause(data);
      setCauses(prev => [newCause, ...prev]);
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Cause created successfully",
      });
    } catch (error) {
      console.error('Error creating cause:', error);
      toast({
        title: "Error",
        description: "Failed to create cause",
        variant: "destructive",
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      isPublic: undefined,
      organizationId: ''
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organization Causes</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Cause
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Cause</DialogTitle>
              <DialogDescription>
                Create a new cause for your organization
              </DialogDescription>
            </DialogHeader>
            <CreateCauseForm onSubmit={handleCreateCause} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search causes..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-filter"
                  checked={filters.isPublic === true}
                  onCheckedChange={(checked) => 
                    handleFilterChange('isPublic', checked ? true : undefined)
                  }
                />
                <Label htmlFor="public-filter">Public causes only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="private-filter"
                  checked={filters.isPublic === false}
                  onCheckedChange={(checked) => 
                    handleFilterChange('isPublic', checked ? false : undefined)
                  }
                />
                <Label htmlFor="private-filter">Private causes only</Label>
              </div>
              <div>
                <Label htmlFor="org-filter">Organization ID</Label>
                <Input
                  id="org-filter"
                  placeholder="Filter by organization ID"
                  value={filters.organizationId}
                  onChange={(e) => handleFilterChange('organizationId', e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Causes List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading causes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {causes.map((cause) => (
            <Card key={cause.causeId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cause.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{cause.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={cause.isPublic ? "default" : "secondary"}>
                    {cause.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-gray-500">
                  <p>Organization ID: {cause.organizationId}</p>
                  <p>Cause ID: {cause.causeId}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {causes.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No causes found</p>
              <p className="text-sm mt-2">Create your first cause to get started</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

const CreateCauseForm = ({ onSubmit }: { onSubmit: (data: CauseCreateData) => void }) => {
  const [formData, setFormData] = useState<CauseCreateData>({
    organizationId: '',
    title: '',
    description: '',
    isPublic: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof CauseCreateData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="organizationId">Organization ID *</Label>
        <Input
          id="organizationId"
          value={formData.organizationId}
          onChange={(e) => handleInputChange('organizationId', e.target.value)}
          placeholder="Enter organization ID"
          required
        />
      </div>
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter cause title"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter cause description"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={formData.isPublic}
          onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
        />
        <Label htmlFor="isPublic">Public cause</Label>
      </div>
      <Button type="submit" className="w-full">
        Create Cause
      </Button>
    </form>
  );
};

export default OrganizationCauses;
