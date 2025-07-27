
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { organizationSpecificApi, type Cause, type CauseCreateData, type CausesResponse } from '@/api/organization.api';
import { useToast } from '@/hooks/use-toast';

const OrganizationCauses = () => {
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublic, setFilterPublic] = useState<'all' | 'public' | 'private'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState<CauseCreateData>({
    organizationId: '',
    title: '',
    description: '',
    isPublic: true
  });

  const fetchCauses = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      };

      const response = await organizationSpecificApi.get<CausesResponse>('/organization/api/v1/causes', params);
      setCauses(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error fetching causes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load causes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCauses();
  }, []);

  const handleCreateCause = async () => {
    try {
      if (!createForm.title || !createForm.description) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive'
        });
        return;
      }

      await organizationSpecificApi.post<Cause>('/organization/api/v1/causes', createForm);
      
      toast({
        title: 'Success',
        description: 'Cause created successfully!',
        variant: 'default'
      });

      setIsCreateDialogOpen(false);
      setCreateForm({
        organizationId: '',
        title: '',
        description: '',
        isPublic: true
      });
      
      // Refresh the causes list
      fetchCauses();
    } catch (error) {
      console.error('Error creating cause:', error);
      toast({
        title: 'Error',
        description: 'Failed to create cause. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const filteredCauses = causes.filter(cause => {
    const matchesSearch = cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cause.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterPublic === 'all' || 
                         (filterPublic === 'public' && cause.isPublic) ||
                         (filterPublic === 'private' && !cause.isPublic);
    
    return matchesSearch && matchesFilter;
  });

  const handlePageChange = (page: number) => {
    fetchCauses(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organization Causes</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Cause
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Cause</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="organizationId">Organization ID</Label>
                <Input
                  id="organizationId"
                  value={createForm.organizationId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, organizationId: e.target.value }))}
                  placeholder="Enter organization ID"
                />
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter cause title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter cause description"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={createForm.isPublic}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">Make this cause public</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCause} className="bg-blue-600 hover:bg-blue-700">
                  Create Cause
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search causes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPublic} onValueChange={(value: 'all' | 'public' | 'private') => setFilterPublic(value)}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Causes</SelectItem>
            <SelectItem value="public">Public Only</SelectItem>
            <SelectItem value="private">Private Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Causes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCauses.map((cause) => (
          <Card key={cause.causeId} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{cause.title}</CardTitle>
                <Badge variant={cause.isPublic ? "default" : "secondary"}>
                  {cause.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {cause.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Org ID: {cause.organizationId}
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCauses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No causes found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrganizationCauses;
