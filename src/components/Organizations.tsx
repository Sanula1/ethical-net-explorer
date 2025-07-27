
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationApi, Organization } from '@/api/organization.api';

interface OrganizationsProps {
  onOrganizationLoginClick?: () => void;
}

const Organizations = ({ onOrganizationLoginClick }: OrganizationsProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'INSTITUTE' | 'GLOBAL'>('all');
  const [publicFilter, setPublicFilter] = useState<'all' | 'public' | 'private'>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [organizations, searchTerm, typeFilter, publicFilter]);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await organizationApi.getOrganizations({
        page: 1,
        limit: 10,
        search: searchTerm
      });
      setOrganizations(response.data);
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

  const filterOrganizations = () => {
    let filtered = organizations;

    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(org => org.type === typeFilter);
    }

    if (publicFilter !== 'all') {
      filtered = filtered.filter(org => 
        publicFilter === 'public' ? org.isPublic : !org.isPublic
      );
    }

    setFilteredOrganizations(filtered);
  };

  const handleDelete = async (organizationId: string) => {
    try {
      await organizationApi.deleteOrganization(organizationId);
      toast({
        title: "Success",
        description: "Organization deleted successfully",
      });
      loadOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      });
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'INSTITUTE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
          <p className="text-muted-foreground">Manage your organizations</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onOrganizationLoginClick}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'INSTITUTE' | 'GLOBAL')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="INSTITUTE">Institute</option>
          <option value="GLOBAL">Global</option>
        </select>

        <select
          value={publicFilter}
          onChange={(e) => setPublicFilter(e.target.value as 'all' | 'public' | 'private')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((organization) => (
          <Card key={organization.organizationId} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{organization.name}</CardTitle>
                    <CardDescription className="text-sm">
                      ID: {organization.organizationId}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(organization.organizationId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getTypeColor(organization.type)}>
                    {organization.type}
                  </Badge>
                  {organization.isPublic && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Public
                    </Badge>
                  )}
                </div>
                
                {organization.instituteId && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Institute ID: {organization.instituteId}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {organization.memberCount || 0} members
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {organization.causeCount || 0} causes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No organizations found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm
              ? 'Try adjusting your search or filters'
              : 'Create your first organization to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Organizations;
