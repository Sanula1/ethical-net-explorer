
import React from 'react';
import Profile from '@/components/Profile';
import Appearance from '@/components/Appearance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

interface OrganizationDashboardProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  organizationData: any;
}

const OrganizationDashboard = ({ currentPage, onPageChange, organizationData }: OrganizationDashboardProps) => {
  const renderContent = () => {
    switch (currentPage) {
      case 'profile':
        return <Profile />;
      case 'appearance':
        return <Appearance />;
      case 'select-organization':
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Access
                </CardTitle>
                <CardDescription>
                  Select an organization to access its resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Available Organizations</h3>
                    <div className="space-y-2">
                      {organizationData?.permissions?.organizations?.map((orgId: string) => (
                        <div key={orgId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span>Organization {orgId}</span>
                          <span className="text-sm text-gray-500">Access Granted</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {organizationData?.permissions?.isGlobalAdmin && (
                    <div className="p-4 border rounded-lg border-green-200 bg-green-50 dark:bg-green-900/20">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        Global Admin Access
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You have global administrator privileges across all organizations.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      {renderContent()}
    </div>
  );
};

export default OrganizationDashboard;
