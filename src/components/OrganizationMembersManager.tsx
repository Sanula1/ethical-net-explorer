
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { organizationApi, OrganizationMember, AssignRoleData } from '@/api/organization.api';
import { useToast } from '@/hooks/use-toast';

interface OrganizationMembersManagerProps {
  organizationId: string;
}

const OrganizationMembersManager = ({ organizationId }: OrganizationMembersManagerProps) => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [roleBreakdown, setRoleBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [assigningRole, setAssigningRole] = useState(false);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await organizationApi.getOrganizationMembers(organizationId);
      setMembers(response.members);
      setTotalMembers(response.totalMembers);
      setRoleBreakdown(response.roleBreakdown);
    } catch (error) {
      console.error('Error fetching organization members:', error);
      toast({
        title: "Error",
        description: "Failed to load organization members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select both a user and a role",
        variant: "destructive",
      });
      return;
    }

    try {
      setAssigningRole(true);
      const assignData: AssignRoleData = {
        userId: selectedUserId,
        role: selectedRole
      };

      await organizationApi.assignRole(organizationId, assignData);
      
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });

      // Reset form and refresh members
      setSelectedUserId('');
      setSelectedRole('');
      fetchMembers();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setAssigningRole(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'president':
        return 'default';
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      case 'member':
        return 'outline';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Members</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage organization members and their roles
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMembers}</p>
            </div>
          </CardContent>
        </Card>

        {Object.entries(roleBreakdown).map(([role, count]) => (
          <Card key={role}>
            <CardContent className="flex items-center p-6">
              <Shield className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{role}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Role Form */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Role to Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="PRESIDENT">President</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-end">
              <Button 
                onClick={handleAssignRole}
                disabled={assigningRole || !selectedUserId || !selectedRole}
                className="w-full"
              >
                {assigningRole ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Members List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {member.isVerified ? (
                        <UserCheck className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <UserX className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      <span className={member.isVerified ? 'text-green-600' : 'text-red-600'}>
                        {member.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {members.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Members Found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              This organization doesn't have any members yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationMembersManager;
