
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Award, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizationSpecificApi, type Cause, type CauseCreateData, type CauseResponse } from '@/api/organization.api';

const Causes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublic, setFilterPublic] = useState<boolean | null>(null);

  // Create cause form state
  const [createForm, setCreateForm] = useState<CauseCreateData>({
    organizationId: '',
    title: '',
    description: '',
    isPublic: true
  });

  // Check if user is OrganizationManager
  const isOrganizationManager = user?.role === 'OrganizationManager';

  useEffect(() => {
    if (isOrganizationManager) {
      loadCauses();
    }
  }, [isOrganizationManager]);

  const loadCauses = async () => {
    try {
      setIsLoading(true);
      const response = await organizationSpecificApi.get<CauseResponse>('/organization/api/v1/causes');
      setCauses(response.data || []);
    } catch (error) {
      console.error('Error loading causes:', error);
      toast({
        title: "Error",
        description: "Failed to load causes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCause = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.title.trim() || !createForm.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await organizationSpecificApi.post<Cause>('/organization/api/v1/causes', createForm);
      
      setCauses(prev => [response, ...prev]);
      setIsCreateDialogOpen(false);
      setCreateForm({
        organizationId: '',
        title: '',
        description: '',
        isPublic: true
      });
      
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

  // Filter causes based on search and public filter
  const filteredCauses = causes.filter(cause => {
    const matchesSearch = !searchTerm || 
      cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cause.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPublic = filterPublic === null || cause.isPublic === filterPublic;
    
    return matchesSearch && matchesPublic;
  });

  if (!isOrganizationManager) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only Organization Managers can access this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Causes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your organization's causes and initiatives
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Cause
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Cause</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCause} className="space-y-4">
              <div>
                <Label htmlFor="organizationId">Organization ID</Label>
                <Input
                  id="organizationId"
                  value={createForm.organizationId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, organizationId: e.target.value }))}
                  placeholder="Enter organization ID"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter cause title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter cause description"
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={createForm.isPublic}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">Public Cause</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Create Cause
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search causes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Button
            variant={filterPublic === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPublic(null)}
          >
            All
          </Button>
          <Button
            variant={filterPublic === true ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPublic(true)}
          >
            Public
          </Button>
          <Button
            variant={filterPublic === false ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPublic(false)}
          >
            Private
          </Button>
        </div>
      </div>

      {/* Causes Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading causes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCauses.map((cause) => (
            <Card key={cause.causeId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>ID: {cause.causeId}</span>
                  <span>Org: {cause.organizationId}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredCauses.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No causes found</p>
              <p className="text-sm mt-2">
                {searchTerm || filterPublic !== null 
                  ? 'Try adjusting your search or filters'
                  : 'Click "Create Cause" to add your first cause'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Causes;
