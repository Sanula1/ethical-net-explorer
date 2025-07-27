import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Home,
  Users,
  GraduationCap,
  UserCheck,
  Users2,
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  CheckCircle,
  QrCode,
  MessageSquare,
  Video,
  FileText,
  TestTube,
  BarChart3,
  Settings,
  Building,
  User,
  Palette,
  MonitorPlay,
  Building2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ isOpen, onClose, currentPage, onPageChange }: SidebarProps) => {
  const { user, selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization } = useAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'AttendanceMarker', 'Parent'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'organizations',
      label: 'Organizations',
      icon: Building2,
      roles: ['InstituteAdmin', 'Student', 'Teacher'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      roles: ['SystemAdmin', 'InstituteAdmin'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'students',
      label: 'Students',
      icon: GraduationCap,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: UserCheck,
      roles: ['SystemAdmin', 'InstituteAdmin'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'parents',
      label: 'Parents',
      icon: Users2,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'grades',
      label: 'Grades',
      icon: Award,
      roles: ['SystemAdmin', 'InstituteAdmin'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: BookOpen,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'subjects',
      label: 'Subjects',
      icon: Calendar,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'institutes',
      label: 'Institutes',
      icon: Building,
      roles: ['SystemAdmin'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'grading',
      label: 'Grading',
      icon: ClipboardList,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CheckCircle,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'AttendanceMarker', 'Parent'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'attendance-marking',
      label: 'Mark Attendance',
      icon: UserCheck,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'AttendanceMarker'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'attendance-markers',
      label: 'Attendance Markers',
      icon: Users,
      roles: ['SystemAdmin', 'InstituteAdmin'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'qr-attendance',
      label: 'QR Attendance',
      icon: QrCode,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'AttendanceMarker'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'lectures',
      label: 'Lectures',
      icon: MessageSquare,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'live-lectures',
      label: 'Live Lectures',
      icon: Video,
      roles: ['SystemAdmin', 'InstituteAdmin'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'homework',
      label: 'Homework',
      icon: FileText,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: TestTube,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'results',
      label: 'Results',
      icon: BarChart3,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'Parent'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'AttendanceMarker', 'Parent'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'institute-details',
      label: 'Institute Details',
      icon: Building,
      roles: ['SystemAdmin', 'InstituteAdmin'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: Palette,
      roles: ['SystemAdmin', 'InstituteAdmin', 'Teacher', 'Student', 'AttendanceMarker', 'Parent'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'parent-children',
      label: 'My Children',
      icon: Users2,
      roles: ['Parent'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'select-institute',
      label: 'Select Institute',
      icon: Building,
      roles: ['InstituteAdmin', 'Teacher', 'Student', 'AttendanceMarker'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'select-class',
      label: 'Select Class',
      icon: BookOpen,
      roles: ['Teacher', 'AttendanceMarker'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
    {
      id: 'select-subject',
      label: 'Select Subject',
      icon: Calendar,
      roles: ['Teacher'],
      badge: null,
      requiresInstitute: false,
      requiresClass: false,
      requiresSubject: false,
      requiresChild: false,
    },
  ];

  const filteredItems = navigationItems.filter(item => {
    const hasRole = item.roles.includes(user?.role || '');
    if (!hasRole) return false;

    if (item.requiresInstitute && !selectedInstitute) return false;
    if (item.requiresClass && !selectedClass) return false;
    if (item.requiresSubject && !selectedSubject) return false;
    if (item.requiresChild && !selectedChild) return false;

    return true;
  });

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full",
      "lg:translate-x-0 lg:static lg:inset-0"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Navigation
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3 text-sm",
                  currentPage === item.id && "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100",
                  currentPage !== item.id && "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => {
                  onPageChange(item.id);
                  onClose();
                }}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar;
