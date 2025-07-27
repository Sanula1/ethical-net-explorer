
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Target, Shield, Plus } from 'lucide-react';
import { organizationApi, Organization, OrganizationQueryParams } from '@/api/organization.api';
import { useAuth } from '@/contexts/AuthContext';

interface OrganizationSelectorProps {
  onCreateClick?: () => void;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ onCreateClick }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const { user } = useAuth();

  const fetchOrganizations = async (params: OrganizationQueryParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      let response;
      
      // For InstituteAdmin, Student, Teacher roles - fetch enrolled organizations
      if (user?.role === 'InstituteAdmin' || user?.role === 'Student' || user?.role === 'Teacher') {
        response = await organizationApi.getUserEnrolledOrganizations({
          page: 1,
          limit: 10,
          ...params
        });
      } else {
        // For other roles (like OrganizationManager) - fetch all organizations
        response = await organizationApi.getOrganizations({
          page: 1,
          limit: 10,
          ...params
        });
      }
      
      setOrganizations(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [user?.role]);

  const handleSelectOrganization = (org: Organization) => {
    // Store selected organization in localStorage or context
    localStorage.setItem('selectedOrganization', JSON.stringify(org));
    console.log('Selected organization:', org);
    // You can add navigation or state management here
  };

  const handlePageChange = (newPage: number) => {
    fetchOrganizations({ page: newPage, limit: pagination.limit });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading organizations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={() => fetchOrganizations()}>
          Try Again
        </Button>
      </div>
    );
  }

  const isEnrolledView = user?.role === 'InstituteAdmin' || user?.role === 'Student' || user?.role === 'Teacher';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEnrolledView ? 'My Organizations' : 'Organizations'}
        </h1>
        {!isEnrolledView && onCreateClick && (
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        )}
      </div>
      
      {organizations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              {isEnrolledView ? 'No enrolled organizations found' : 'No organizations found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {organizations.map((org) => (
            <Card key={org.organizationId} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant={org.type === 'INSTITUTE' ? 'default' : 'secondary'}>
                        {org.type}
                      </Badge>
                      {org.isVerified && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                      {org.isPublic && <Badge variant="outline">Public</Badge>}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {org.userRole && (
                      <p>Role: <span className="font-medium">{org.userRole}</span></p>
                    )}
                    {org.joinedAt && (
                      <p>Joined: {new Date(org.joinedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{org.memberCount || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{org.causeCount || 0} causes</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleSelectOrganization(org)}
                    variant="outline"
                  >
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            disabled={!pagination.hasPrev}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
