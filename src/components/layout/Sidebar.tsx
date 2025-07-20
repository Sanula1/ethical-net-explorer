import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  School,
  ClipboardList,
  BarChart3,
  Settings,
  User,
  Building2,
  QrCode,
  X,
  Award,
  Video,
  LogOut,
  Menu,
  FileText,
  ArrowLeft,
  Notebook,
  Images,
  Palette
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ isOpen, onClose, currentPage, onPageChange }: SidebarProps) => {
  const { user, selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization, logout, setSelectedInstitute, setSelectedClass, setSelectedSubject, setSelectedChild, setSelectedOrganization } = useAuth();

  // Get menu items based on current selection state
  const getMenuItems = () => {
    // Base items that are always available for all users
    const baseItems = [
      {
        id: 'dashboard',
        label: selectedInstitute ? 'Dashboard' : 'Select Institutes',
        icon: LayoutDashboard,
        permission: 'view-dashboard'
      },
      {
        id: 'organizations',
        label: 'Organizations',
        icon: Building2,
        permission: 'view-organizations'
      }
    ];

    // If no institute is selected, return basic navigation
    if (!selectedInstitute) {
      return baseItems;
    }

    // If institute is selected, show full navigation
    return [
      ...baseItems,
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        permission: 'view-users'
      },
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        permission: 'view-students'
      },
      {
        id: 'parents',
        label: 'Parents',
        icon: Users,
        permission: 'view-parents'
      },
      // Remove teachers section for SystemAdmin
      ...(user?.role !== 'SystemAdmin' ? [{
        id: 'teachers',
        label: 'Teachers',
        icon: UserCheck,
        permission: 'view-teachers'
      }] : []),
      {
        id: 'classes',
        label: 'All Classes',
        icon: School,
        permission: 'view-classes'
      },
      {
        id: 'subjects',
        label: 'All Subjects',
        icon: BookOpen,
        permission: 'view-subjects'
      },
      // Only show selection options for non-SystemAdmin users
      ...(user?.role !== 'SystemAdmin' ? [
        {
          id: 'select-class',
          label: 'Select Class',
          icon: School,
          permission: 'view-classes'
        },
        {
          id: 'select-subject',
          label: 'Select Subject',
          icon: BookOpen,
          permission: 'view-subjects'
        }
      ] : []),
      {
        id: 'institutes',
        label: 'Institutes',
        icon: Building2,
        permission: 'view-institutes'
      }
    ];
  };

  const attendanceItems = [
    {
      id: 'attendance',
      label: 'View Attendance',
      icon: ClipboardList,
      permission: 'view-attendance'
    },
    {
      id: 'attendance-marking',
      label: 'Mark Attendance',
      icon: UserCheck,
      permission: 'mark-attendance'
    },
    {
      id: 'attendance-markers',
      label: 'Attendance Markers',
      icon: Users,
      permission: 'manage-attendance-markers'
    },
    {
      id: 'qr-attendance',
      label: 'QR Attendance',
      icon: QrCode,
      permission: 'mark-attendance'
    }
  ];

  const systemItems = [
    {
      id: 'grading',
      label: 'Grading',
      icon: BarChart3,
      permission: 'view-grading'
    },
    {
      id: 'live-lectures',
      label: 'Live Lectures',
      icon: Video,
      permission: 'view-lectures'
    },
    {
      id: 'homework',
      label: 'Homework',
      icon: Notebook,
      permission: 'view-homework'
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: FileText,
      permission: 'view-exams'
    },
    {
      id: 'results',
      label: 'Results',
      icon: ClipboardList,
      permission: 'view-results'
    }
  ];

  const settingsItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      permission: 'view-profile'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      permission: 'view-appearance'
    },
    ...(selectedInstitute ? [{
      id: 'institute-details',
      label: 'Institute Details',
      icon: Building2,
      permission: 'view-institute-details'
    }] : []),
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      permission: 'view-settings'
    }
  ];

  const userRole = user?.role || 'Student';
  const menuItems = getMenuItems();

  const filterItemsByPermission = (items: any[]) => {
    return items.filter(item => AccessControl.hasPermission(userRole as any, item.permission));
  };

  const handleItemClick = (itemId: string) => {
    console.log('Sidebar item clicked:', itemId);
    onPageChange(itemId);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleBackNavigation = () => {
    if (selectedOrganization) {
      // Go back from organization level to organization selection
      setSelectedOrganization(null);
    } else if (selectedChild) {
      // Go back from child level to children selection
      setSelectedChild(null);
    } else if (selectedSubject) {
      // Go back from subject level to class level
      setSelectedSubject(null);
    } else if (selectedClass) {
      // Go back from class level to institute level
      setSelectedClass(null);
    } else if (selectedInstitute) {
      // Go back from institute level to institute selection
      setSelectedInstitute(null);
    }
  };

  const SidebarSection = ({ title, items }: { title: string; items: any[] }) => {
    const filteredItems = filterItemsByPermission(items);
    
    if (filteredItems.length === 0) return null;

    return (
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {filteredItems.map((item) => (
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
    );
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
            <School className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
              EduSystem
            </span>
          </div>
          <div className="flex items-center space-x-1">
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

        {/* Context Info - Only show for non-SystemAdmin users */}
        {user?.role !== 'SystemAdmin' && (selectedInstitute || selectedClass || selectedSubject || selectedChild || selectedOrganization) && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Current Selection
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackNavigation}
                className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                aria-label="Go Back"
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1 text-xs">
              {selectedOrganization && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Organization:</span> 
                  <span className="ml-1 truncate">{selectedOrganization.name}</span>
                </div>
              )}
              {selectedInstitute && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Institute:</span> 
                  <span className="ml-1 truncate">{selectedInstitute.name}</span>
                </div>
              )}
              {selectedClass && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Class:</span> 
                  <span className="ml-1 truncate">{selectedClass.name}</span>
                </div>
              )}
              {selectedSubject && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Subject:</span> 
                  <span className="ml-1 truncate">{selectedSubject.name}</span>
                </div>
              )}
              {selectedChild && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Child:</span> 
                  <span className="ml-1 truncate">
                    {selectedChild.user.firstName} {selectedChild.user.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
          <div className="space-y-2">
            <SidebarSection title="Main" items={menuItems} />
            {/* Only show attendance and academic sections if institute is selected */}
            {selectedInstitute && (
              <>
                <SidebarSection title="Attendance" items={attendanceItems} />
                <SidebarSection title="Academic" items={systemItems} />
              </>
            )}
            <SidebarSection title="Settings" items={settingsItems} />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
            <div className="truncate">
              <span>Logged in as:</span> 
              <span className="font-medium ml-1">{user?.name}</span>
            </div>
            <div>
              <span>Role:</span> 
              <span className="font-medium ml-1">{user?.role}</span>
            </div>
          </div>
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

export default Sidebar;
