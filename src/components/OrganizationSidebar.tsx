
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  User,
  Palette,
  LogOut,
  ArrowLeft,
  X,
  Menu,
  School
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OrganizationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  organization: any;
  onBack: () => void;
}

const OrganizationSidebar = ({ 
  isOpen, 
  onClose, 
  currentPage, 
  onPageChange, 
  organization, 
  onBack 
}: OrganizationSidebarProps) => {
  const { logout } = useAuth();

  const menuItems = [
    {
      id: 'select-organization',
      label: 'Select Organization',
      icon: Building2,
    },
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

  const handleItemClick = (itemId: string) => {
    onPageChange(itemId);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 sm:w-80 md:w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 min-w-0">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
              {organization ? organization.name : 'Organizations'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close Sidebar"
            >
              <X className="h-4 w-4 md:hidden" />
              <Menu className="h-4 w-4 hidden md:block" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
          <div className="space-y-2">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                Main
              </h3>
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-start h-9 sm:h-10 px-3 text-sm ${
                      currentPage === item.id 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-r-2 border-blue-600' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 h-8 sm:h-9"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default OrganizationSidebar;
