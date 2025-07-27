
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Book,
  Calendar,
  Settings,
  User,
  Building2,
  ListChecks,
  Clock,
  QrCode,
  Presentation,
  FileVideo,
  BookOpen,
  ScrollText,
  BarChartBig,
  ImagePlus,
  Palette,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ isOpen, onClose, currentPage, onPageChange }: SidebarProps) => {
  const { user, logout, selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent', 'AttendanceMarker', 'OrganizationManager']
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      roles: ['SystemAdmin', 'InstituteAdmin']
    },
    {
      id: 'students',
      label: 'Students',
      icon: Book,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'OrganizationManager']
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: User,
      roles: ['SystemAdmin', 'InstituteAdmin']
    },
    {
      id: 'parents',
      label: 'Parents',
      icon: User,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher']
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: BarChartBig,
      roles: ['SystemAdmin', 'InstituteAdmin']
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: ListChecks,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher']
    },
    {
      id: 'subjects',
      label: 'Subjects',
      icon: Book,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher']
    },
    {
      id: 'institutes',
      label: 'Institutes',
      icon: Building2,
      roles: ['SystemAdmin']
    },
    {
      id: 'grading',
      label: 'Grading',
      icon: BarChartBig,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher']
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: Calendar,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent']
    },
    {
      id: 'attendance-marking',
      label: 'Attendance Marking',
      icon: Clock,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'AttendanceMarker']
    },
    {
      id: 'attendance-markers',
      label: 'Attendance Markers',
      icon: QrCode,
      roles: ['SystemAdmin', 'InstituteAdmin']
    },
    {
      id: 'qr-attendance',
      label: 'QR Attendance',
      icon: QrCode,
      roles: ['SystemAdmin', 'InstituteAdmin', 'AttendanceMarker']
    },
    {
      id: 'lectures',
      label: 'Lectures',
      icon: Presentation,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'OrganizationManager']
    },
    {
      id: 'live-lectures',
      label: 'Live Lectures',
      icon: FileVideo,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher']
    },
    {
      id: 'homework',
      label: 'Homework',
      icon: BookOpen,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent']
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: ScrollText,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent']
    },
    {
      id: 'results',
      label: 'Results',
      icon: BarChartBig,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent']
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent', 'AttendanceMarker', 'OrganizationManager']
    },
    {
      id: 'institute-details',
      label: 'Institute Details',
      icon: Building2,
      roles: ['SystemAdmin', 'InstituteAdmin']
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: ImagePlus,
      roles: ['OrganizationManager']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      roles: ['OrganizationManager']
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent', 'AttendanceMarker', 'OrganizationManager']
    },
    {
      id: 'organizations',
      label: 'Organizations',
      icon: Building2,
      roles: ['InstituteAdmin', 'Student', 'Teacher']
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'OrganizationManager') {
      return item.roles.includes(user.role);
    }
    return item.roles.includes(user?.role || '');
  });

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-white shadow-sm transition-transform duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-center p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.imageUrl} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h2 className="font-semibold text-gray-800 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          {selectedInstitute && <p className="text-sm text-gray-500 dark:text-gray-400">
            Institute: {selectedInstitute.name}
          </p>}
          {selectedClass && <p className="text-sm text-gray-500 dark:text-gray-400">
            Class: {selectedClass.name}
          </p>}
          {selectedSubject && <p className="text-sm text-gray-500 dark:text-gray-400">
            Subject: {selectedSubject.name}
          </p>}
          {selectedChild && <p className="text-sm text-gray-500 dark:text-gray-400">
            Child: {selectedChild.user.firstName} {selectedChild.user.lastName}
          </p>}
          {selectedOrganization && <p className="text-sm text-gray-500 dark:text-gray-400">
            Organization: {selectedOrganization.name}
          </p>}
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onPageChange(item.id);
                onClose();
              }}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
