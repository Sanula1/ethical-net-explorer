
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, Trash2, Search, Link, Unlink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizationSpecificApi, type Organization, type OrganizationResponse, type InstituteAssignmentData, type InstituteAssignmentResponse } from '@/api/organization.api';

const OrganizationAssignment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignForm, setAssignForm] = useState<InstituteAssignmentData>({
    instituteId: ''
  });

  // Check if user is OrganizationManager
  const isOrganizationManager = user?.role === 'OrganizationManager';

  useEffect(() => {
    if (isOrganizationManager) {
      loadOrganizations();
    }
  }, [isOrganizationManager]);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await organizationSpecificApi.get<OrganizationResponse>('/organization/api/v1/organizations', {
        page: 1,
        limit: 50
      });
      setOrganizations(response.data || []);
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

  const handleAssignToInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrganization || !assignForm.instituteId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select an organization and enter an institute ID",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await organizationSpecificApi.post<InstituteAssignmentResponse>(
        `/organization/api/v1/organizations/${selectedOrganization.organizationId}/assign-institute`,
        assignForm
      );
      
      // Update the organization in the list
      setOrganizations(prev => 
        prev.map(org => 
          org.organizationId === selectedOrganization.organizationId 
            ? { ...org, instituteId: assignForm.instituteId }
            : org
        )
      );
      
      setIsAssignDialogOpen(false);
      setSelectedOrganization(null);
      setAssignForm({ instituteId: '' });
      
      toast({
        title: "Success",
        description: response.message || "Organization assigned to institute successfully",
      });
    } catch (error) {
      console.error('Error assigning organization to institute:', error);
      toast({
        title: "Error",
        description: "Failed to assign organization to institute",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromInstitute = async (organization: Organization) => {
    if (!organization.instituteId) {
      toast({
        title: "Info",
        description: "This organization is not assigned to any institute",
        variant: "default",
      });
      return;
    }

    try {
      const response = await organizationSpecificApi.delete<InstituteAssignmentResponse>(
        `/organization/api/v1/organizations/${organization.organizationId}/remove-institute`
      );
      
      // Update the organization in the list
      setOrganizations(prev => 
        prev.map(org => 
          org.organizationId === organization.organizationId 
            ? { ...org, instituteId: null }
            : org
        )
      );
      
      toast({
        title: "Success",
        description: response.message || "Organization removed from institute successfully",
      });
    } catch (error) {
      console.error('Error removing organization from institute:', error);
      toast({
        title: "Error",
        description: "Failed to remove organization from institute",
        variant: "destructive",
      });
    }
  };

  const openAssignDialog = (organization: Organization) => {
    setSelectedOrganization(organization);
    setAssignForm({ instituteId: organization.instituteId || '' });
    setIsAssignDialogOpen(true);
  };

  // Filter organizations based on search
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.organizationId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Organization Assignment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Assign organizations to institutes or remove assignments
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading organizations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((organization) => (
            <Card key={organization.organizationId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{organization.name}</CardTitle>
                      <CardDescription>ID: {organization.organizationId}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={organization.isPublic ? "default" : "secondary"}>
                    {organization.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
                    <Badge variant="outline">{organization.type}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Institute:</span>
                    <span className="text-sm">
                      {organization.instituteId ? (
                        <Badge variant="secondary">{organization.instituteId}</Badge>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssignDialog(organization)}
                      className="flex-1"
                    >
                      <Link className="h-4 w-4 mr-1" />
                      {organization.instituteId ? 'Reassign' : 'Assign'}
                    </Button>
                    
                    {organization.instituteId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromInstitute(organization)}
                        className="flex-1"
                      >
                        <Unlink className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredOrganizations.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No organizations found</p>
              <p className="text-sm mt-2">
                {searchTerm 
                  ? 'Try adjusting your search term'
                  : 'No organizations available'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedOrganization?.instituteId ? 'Reassign' : 'Assign'} Organization to Institute
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignToInstitute} className="space-y-4">
            <div>
              <Label>Organization</Label>
              <Input
                value={selectedOrganization?.name || ''}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            
            <div>
              <Label htmlFor="instituteId">Institute ID</Label>
              <Input
                id="instituteId"
                value={assignForm.instituteId}
                onChange={(e) => setAssignForm(prev => ({ ...prev, instituteId: e.target.value }))}
                placeholder="Enter institute ID"
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {selectedOrganization?.instituteId ? 'Reassign' : 'Assign'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAssignDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationAssignment;
