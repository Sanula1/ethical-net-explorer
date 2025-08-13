
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Search, Filter, Eye, EyeOff, Plus, Users, BookOpen } from 'lucide-react';
import { organizationApi, Organization, OrganizationQueryParams, EnrollOrganizationData } from '@/api/organization.api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrganizationEnrollmentProps {
  userRole: string;
}

const OrganizationEnrollment = ({ userRole }: OrganizationEnrollmentProps) => {
  const [enrolledOrganizations, setEnrolledOrganizations] = useState<Organization[]>([]);
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [publicFilter, setPublicFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const { toast } = useToast();

  const fetchEnrolledOrganizations = async () => {
    try {
      const response = await organizationApi.getUserEnrolledOrganizations({
        page: 1,
        limit: 20
      });
      setEnrolledOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching enrolled organizations:', error);
    }
  };

  const fetchAvailableOrganizations = async () => {
    try {
      setLoading(true);
      
      const params: OrganizationQueryParams = {
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter as 'INSTITUTE' | 'GLOBAL' }),
        ...(publicFilter !== 'all' && { isPublic: publicFilter === 'public' })
      };

      const response = await organizationApi.getOrganizations(params);
      setAvailableOrganizations(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching available organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load available organizations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (organization: Organization) => {
    try {
      setEnrollLoading(true);
      
      const enrollData: EnrollOrganizationData = {
        organizationId: organization.organizationId,
        ...(enrollmentKey && { enrollmentKey })
      };

      const response = await organizationApi.enrollOrganization(enrollData);
      
      toast({
        title: "Success",
        description: `Successfully enrolled in ${organization.name}`,
      });

      // Reset form and refresh data
      setEnrollmentKey('');
      setSelectedOrganization(null);
      setShowEnrollDialog(false);
      fetchEnrolledOrganizations();
      fetchAvailableOrganizations();
    } catch (error) {
      console.error('Error enrolling in organization:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in organization",
        variant: "destructive",
      });
    } finally {
      setEnrollLoading(false);
    }
  };

  const openEnrollDialog = (organization: Organization) => {
    setSelectedOrganization(organization);
    setShowEnrollDialog(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setPublicFilter('all');
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAvailableOrganizations();
  };

  useEffect(() => {
    fetchEnrolledOrganizations();
    fetchAvailableOrganizations();
  }, [currentPage, searchTerm, typeFilter, publicFilter]);

  const isEnrolled = (organizationId: string) => {
    return enrolledOrganizations.some(org => org.organizationId === organizationId);
  };

  const renderOrganizationCard = (organization: Organization) => (
    <Card key={organization.organizationId} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{organization.name}</CardTitle>
              <p className="text-sm text-gray-600 capitalize">
                {organization.type.toLowerCase()} Organization
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={organization.isPublic ? "default" : "secondary"}>
              {organization.isPublic ? (
                <><Eye className="h-3 w-3 mr-1" /> Public</>
              ) : (
                <><EyeOff className="h-3 w-3 mr-1" /> Private</>
              )}
            </Badge>
            
            {organization.type === 'INSTITUTE' && (
              <Badge variant="outline">
                <Building2 className="h-3 w-3 mr-1" />
                Institute
              </Badge>
            )}
          </div>
          
          {organization.memberCount !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {organization.memberCount} members
            </div>
          )}
          
          {organization.causeCount !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <BookOpen className="h-4 w-4 mr-1" />
              {organization.causeCount} courses
            </div>
          )}
          
          {isEnrolled(organization.organizationId) ? (
            <Badge variant="default" className="w-full justify-center">
              Already Enrolled
            </Badge>
          ) : (
            <Button 
              onClick={() => openEnrollDialog(organization)}
              className="w-full"
            >
              Enroll
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Enrollment</h2>
          <p className="text-gray-600 dark:text-gray-400">
            View your enrolled organizations and enroll in new ones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('card')}
          >
            Card View
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
        </div>
      </div>

      {/* Enrolled Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Your Enrolled Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {enrolledOrganizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledOrganizations.map(renderOrganizationCard)}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              You haven't enrolled in any organizations yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Find Organizations to Enroll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="INSTITUTE">Institute</SelectItem>
                    <SelectItem value="GLOBAL">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <Select value={publicFilter} onValueChange={setPublicFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 flex items-end">
                <div className="flex gap-2 w-full">
                  <Button type="submit" className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Available Organizations */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableOrganizations.map(renderOrganizationCard)}
            </div>
          ) : (
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableOrganizations.map((organization) => (
                      <TableRow key={organization.organizationId}>
                        <TableCell className="font-medium">{organization.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{organization.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={organization.isPublic ? "default" : "secondary"}>
                            {organization.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </TableCell>
                        <TableCell>{organization.memberCount || 0}</TableCell>
                        <TableCell>{organization.causeCount || 0}</TableCell>
                        <TableCell>
                          {isEnrolled(organization.organizationId) ? (
                            <Badge variant="default">Enrolled</Badge>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => openEnrollDialog(organization)}
                            >
                              Enroll
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {selectedOrganization?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enrollment Key (Optional)</label>
              <Input
                placeholder="Enter enrollment key if required..."
                value={enrollmentKey}
                onChange={(e) => setEnrollmentKey(e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Some organizations may require an enrollment key for access.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => selectedOrganization && handleEnroll(selectedOrganization)}
                disabled={enrollLoading}
                className="flex-1"
              >
                {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEnrollDialog(false)}
                disabled={enrollLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {availableOrganizations.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Organizations Found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {searchTerm || typeFilter !== 'all' || publicFilter !== 'all'
                ? 'No organizations match your current filters.'
                : 'No organizations available for enrollment at the moment.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationEnrollment;
