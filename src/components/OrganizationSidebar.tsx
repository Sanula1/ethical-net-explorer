
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, User, Palette, ArrowLeft } from 'lucide-react';

interface OrganizationSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onBack?: () => void;
  userRole?: string;
}

const OrganizationSidebar = ({ 
  currentPage, 
  onPageChange, 
  onBack, 
  userRole 
}: OrganizationSidebarProps) => {
  const menuItems = [
    {
      id: 'select-organization',
      label: 'Select Organization',
      icon: Building2,
      roles: ['InstituteAdmin', 'Student', 'Teacher']
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      roles: ['InstituteAdmin', 'Student', 'Teacher']
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      roles: ['InstituteAdmin', 'Student', 'Teacher']
    }
  ];

  // Filter menu items based on user role
  const availableItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole || '')
  );

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Organization Portal
          </h2>
        </div>
        
        <nav className="space-y-2">
          {availableItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default OrganizationSidebar;
