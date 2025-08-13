
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface OrganizationMembersProps {
  organizationId: string;
}

const OrganizationMembers = ({ organizationId }: OrganizationMembersProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Organization members and roles
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Members Data</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Members management feature will be implemented soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationMembers;
