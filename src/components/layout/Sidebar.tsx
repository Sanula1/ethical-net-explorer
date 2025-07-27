import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, ArrowLeft, Building2, Images, Users, BookOpen, User, Palette, LayoutDashboard, GraduationCap, CalendarDays, FileVideo, FileText, ClipboardList, BarChart, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Organization } from '@/api/organization.api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  isOrganizationPortal?: boolean;
  selectedOrganization?: Organization;
  onBackToOrganizations?: () => void;
}

const Sidebar = ({ 
  isOpen, 
  onClose, 
  currentPage, 
  onPageChange, 
  isOrganizationPortal = false,
  selectedOrganization,
  onBackToOrganizations
}: SidebarProps) => {
  const { user, selectedInstitute, selectedClass, selectedSubject, selectedChild } = useAuth();

  // Organization portal navigation items
  const organizationPortalItems = [
    { key: 'gallery', label: 'Gallery', icon: Images },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'courses', label: 'Courses', icon: BookOpen },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const mainNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: User },
    { key: 'students', label: 'Students', icon: GraduationCap },
    { key: 'teachers', label: 'Teachers', icon: User },
    { key: 'parents', label: 'Parents', icon: User },
    { key: 'grades', label: 'Grades', icon: BarChart },
    { key: 'classes', label: 'Classes', icon: GraduationCap },
    { key: 'subjects', label: 'Subjects', icon: BookOpen },
    { key: 'institutes', label: 'Institutes', icon: Building2 },
    { key: 'grading', label: 'Grading', icon: BarChart },
    { key: 'attendance', label: 'Attendance', icon: CalendarDays },
    { key: 'attendance-marking', label: 'Attendance Marking', icon: CalendarDays },
    { key: 'attendance-markers', label: 'Attendance Markers', icon: CalendarDays },
    { key: 'qr-attendance', label: 'QR Attendance', icon: CalendarDays },
    { key: 'lectures', label: 'Lectures', icon: FileVideo },
    { key: 'live-lectures', label: 'Live Lectures', icon: FileVideo },
    { key: 'homework', label: 'Homework', icon: FileText },
    { key: 'exams', label: 'Exams', icon: ClipboardList },
    { key: 'results', label: 'Results', icon: BarChart },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'institute-details', label: 'Institute Details', icon: Building2 },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'organizations', label: 'Organizations', icon: Building2 },
  ];

  const studentNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'attendance', label: 'Attendance', icon: CalendarDays },
    { key: 'lectures', label: 'Lectures', icon: FileVideo },
    { key: 'homework', label: 'Homework', icon: FileText },
    { key: 'exams', label: 'Exams', icon: ClipboardList },
    { key: 'results', label: 'Results', icon: BarChart },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'organizations', label: 'Organizations', icon: Building2 },
  ];

  const parentNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'attendance', label: 'Attendance', icon: CalendarDays },
    { key: 'homework', label: 'Homework', icon: FileText },
    { key: 'results', label: 'Results', icon: BarChart },
    { key: 'exams', label: 'Exams', icon: ClipboardList },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'organizations', label: 'Organizations', icon: Building2 },
  ];

  const teacherNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'students', label: 'Students', icon: GraduationCap },
    { key: 'parents', label: 'Parents', icon: User },
    { key: 'classes', label: 'Classes', icon: GraduationCap },
    { key: 'subjects', label: 'Subjects', icon: BookOpen },
    { key: 'grading', label: 'Grading', icon: BarChart },
    { key: 'attendance', label: 'Attendance', icon: CalendarDays },
    { key: 'attendance-marking', label: 'Attendance Marking', icon: CalendarDays },
    { key: 'lectures', label: 'Lectures', icon: FileVideo },
    { key: 'homework', label: 'Homework', icon: FileText },
    { key: 'exams', label: 'Exams', icon: ClipboardList },
    { key: 'results', label: 'Results', icon: BarChart },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'organizations', label: 'Organizations', icon: Building2 },
  ];

  const attendanceMarkerNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'attendance-marking', label: 'Attendance Marking', icon: CalendarDays },
    { key: 'qr-attendance', label: 'QR Attendance', icon: CalendarDays },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'organizations', label: 'Organizations', icon: Building2 },
  ];

  const instituteAdminNavItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'Users', icon: User },
    { key: 'students', label: 'Students', icon: GraduationCap },
    { key: 'teachers', label: 'Teachers', icon: User },
    { key: 'parents', label: 'Parents', icon: User },
    { key: 'grades', label: 'Grades', icon: BarChart },
    { key: 'classes', label: 'Classes', icon: GraduationCap },
    { key: 'subjects', label: 'Subjects', icon: BookOpen },
    { key: 'institutes', label: 'Institutes', icon: Building2 },
    { key: 'grading', label: 'Grading', icon: BarChart },
    { key: 'attendance', label: 'Attendance', icon: CalendarDays },
    { key: 'attendance-marking', label: 'Attendance Marking', icon: CalendarDays },
    { key: 'attendance-markers', label: 'Attendance Markers', icon: CalendarDays },
    { key: 'qr-attendance', label: 'QR Attendance', icon: CalendarDays },
    { key: 'lectures', label: 'Lectures', icon: FileVideo },
    { key: 'live-lectures', label: 'Live Lectures', icon: FileVideo },
    { key: 'homework', label: 'Homework', icon: FileText },
    { key: 'exams', label: 'Exams', icon: ClipboardList },
    { key: 'results', label: 'Results', icon: BarChart },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'institute-details', label: 'Institute Details', icon: Building2 },
    { key: 'appearance', label: 'Appearance', icon: Palette },
        { key: 'organizations', label: 'Organizations', icon: Building2 },
  ];

  if (isOrganizationPortal) {
    return (
      <>
        {/* Mobile backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedOrganization?.name}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Organization Portal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-2">
              {/* Back button */}
              <Button
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={onBackToOrganizations}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Organizations
              </Button>
              
              <Separator className="my-2" />

              {/* Organization portal navigation */}
              {organizationPortalItems.map((item) => (
                <Button
                  key={item.key}
                  variant={currentPage === item.key ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    onPageChange(item.key);
                    onClose();
                  }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </>
    );
  }

  let navigationItems = mainNavItems;

  if (user?.role === 'Student') {
    navigationItems = studentNavItems;
  } else if (user?.role === 'Parent') {
    navigationItems = parentNavItems;
  } else if (user?.role === 'Teacher') {
    navigationItems = teacherNavItems;
  } else if (user?.role === 'AttendanceMarker') {
    navigationItems = attendanceMarkerNavItems;
  } else if (user?.role === 'InstituteAdmin') {
    navigationItems = instituteAdminNavItems;
  } else if (user?.role === 'SystemAdmin') {
    navigationItems = mainNavItems;
  }

  
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">EduFlow</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Education Management</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-2">
            {/* Show limited navigation for OrganizationManager */}
            {user?.role === 'OrganizationManager' ? (
              <>
                <Button
                  variant={currentPage === 'organizations' ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    onPageChange('organizations');
                    onClose();
                  }}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Organizations
                </Button>
                
                <Button
                  variant={currentPage === 'profile' ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    onPageChange('profile');
                    onClose();
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                
                <Button
                  variant={currentPage === 'appearance' ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    onPageChange('appearance');
                    onClose();
                  }}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  Appearance
                </Button>
              </>
            ) : (
              <>
                {navigationItems.map((item) => (
                  <Button
                    key={item.key}
                    variant={currentPage === item.key ? "secondary" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => {
                      onPageChange(item.key);
                      onClose();
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default Sidebar;
