import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  Images,
  Users,
  BookOpen,
  User,
  Palette,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OrganizationSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  organization: any;
  onBack: () => void;
}

const OrganizationSidebar = ({ currentPage, onPageChange, organization, onBack }: OrganizationSidebarProps) => {
  const { logout } = useAuth();

  const menuItems = [
    {
      id: 'organization',
      label: 'Organization',
      icon: Building2,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: Images,
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: BookOpen,
    },
  ];

  const settingsItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            {organization.name}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
              Main
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 px-3 text-sm ${
                    currentPage === item.id 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-r-2 border-blue-600' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => onPageChange(item.id)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
              Settings
            </h3>
            <div className="space-y-1">
              {settingsItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 px-3 text-sm ${
                    currentPage === item.id 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-r-2 border-blue-600' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => onPageChange(item.id)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default OrganizationSidebar;
