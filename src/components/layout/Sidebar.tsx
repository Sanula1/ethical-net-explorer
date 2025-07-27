import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  BarChart3,
  Building2,
  Settings,
  User,
  Palette,
  LogOut,
  UserCheck,
  QrCode,
  Video,
  BookMarked,
  Clock,
  Award,
  UserPlus,
  Baby,
  School,
  Target,
  CheckSquare,
  Users2,
  Building,
  UserCircle,
  Heart,
  Images
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ currentPage, onPageChange }: SidebarProps) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];

    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    // For OrganizationManager role - simplified menu
    if (user.role === 'OrganizationManager') {
      return [
        ...baseItems,
        { id: 'organizations', label: 'Organizations', icon: Building2 },
        { id: 'courses', label: 'Courses', icon: BookOpen },
      ];
    }

    // System Admin gets full access
    if (user.role === 'SystemAdmin') {
      return [
        ...baseItems,
        { id: 'users', label: 'Users', icon: Users },
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'teachers', label: 'Teachers', icon: UserCheck },
        { id: 'parents', label: 'Parents', icon: Baby },
        { id: 'grades', label: 'Grades', icon: Target },
        { id: 'classes', label: 'Classes', icon: School },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'institutes', label: 'Institutes', icon: Building },
        { id: 'grading', label: 'Grading', icon: Award },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'attendance-marking', label: 'Mark Attendance', icon: CheckSquare },
        { id: 'attendance-markers', label: 'Attendance Markers', icon: Users2 },
        { id: 'qr-attendance', label: 'QR Attendance', icon: QrCode },
        { id: 'lectures', label: 'Lectures', icon: Video },
        { id: 'live-lectures', label: 'Live Lectures', icon: Video },
        { id: 'homework', label: 'Homework', icon: FileText },
        { id: 'exams', label: 'Exams', icon: ClipboardList },
        { id: 'results', label: 'Results', icon: BarChart3 },
        { id: 'institute-details', label: 'Institute Details', icon: Building },
      ];
    }

    // Student role - simplified interface
    if (user.role === 'Student') {
      return [
        ...baseItems,
        { id: 'select-institute', label: 'Select Institute', icon: Building },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'lectures', label: 'Lectures', icon: Video },
        { id: 'homework', label: 'Homework', icon: FileText },
        { id: 'exams', label: 'Exams', icon: ClipboardList },
        { id: 'results', label: 'Results', icon: BarChart3 },
      ];
    }

    // Parent role
    if (user.role === 'Parent') {
      return [
        ...baseItems,
        { id: 'parent-children', label: 'My Children', icon: Heart },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'homework', label: 'Homework', icon: FileText },
        { id: 'results', label: 'Results', icon: BarChart3 },
        { id: 'exams', label: 'Exams', icon: ClipboardList },
      ];
    }

    // Teacher role
    if (user.role === 'Teacher') {
      return [
        ...baseItems,
        { id: 'select-institute', label: 'Select Institute', icon: Building },
        { id: 'select-class', label: 'Select Class', icon: School },
        { id: 'select-subject', label: 'Select Subject', icon: BookOpen },
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'parents', label: 'Parents', icon: Baby },
        { id: 'classes', label: 'Classes', icon: School },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'grading', label: 'Grading', icon: Award },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'attendance-marking', label: 'Mark Attendance', icon: CheckSquare },
        { id: 'lectures', label: 'Lectures', icon: Video },
        { id: 'homework', label: 'Homework', icon: FileText },
        { id: 'exams', label: 'Exams', icon: ClipboardList },
        { id: 'results', label: 'Results', icon: BarChart3 },
      ];
    }

    // AttendanceMarker role
    if (user.role === 'AttendanceMarker') {
      return [
        ...baseItems,
        { id: 'select-institute', label: 'Select Institute', icon: Building },
        { id: 'select-class', label: 'Select Class', icon: School },
        { id: 'attendance-marking', label: 'Mark Attendance', icon: CheckSquare },
        { id: 'qr-attendance', label: 'QR Attendance', icon: QrCode },
      ];
    }

    // Default for other roles (InstituteAdmin, etc.)
    return [
      ...baseItems,
      { id: 'select-institute', label: 'Select Institute', icon: Building },
      { id: 'select-class', label: 'Select Class', icon: School },
      { id: 'select-subject', label: 'Select Subject', icon: BookOpen },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'students', label: 'Students', icon: GraduationCap },
      { id: 'teachers', label: 'Teachers', icon: UserCheck },
      { id: 'parents', label: 'Parents', icon: Baby },
      { id: 'grades', label: 'Grades', icon: Target },
      { id: 'classes', label: 'Classes', icon: School },
      { id: 'subjects', label: 'Subjects', icon: BookOpen },
      { id: 'institutes', label: 'Institutes', icon: Building },
      { id: 'grading', label: 'Grading', icon: Award },
      { id: 'attendance', label: 'Attendance', icon: Calendar },
      { id: 'attendance-marking', label: 'Mark Attendance', icon: CheckSquare },
      { id: 'attendance-markers', label: 'Attendance Markers', icon: Users2 },
      { id: 'qr-attendance', label: 'QR Attendance', icon: QrCode },
      { id: 'lectures', label: 'Lectures', icon: Video },
      { id: 'live-lectures', label: 'Live Lectures', icon: Video },
      { id: 'homework', label: 'Homework', icon: FileText },
      { id: 'exams', label: 'Exams', icon: ClipboardList },
      { id: 'results', label: 'Results', icon: BarChart3 },
      { id: 'institute-details', label: 'Institute Details', icon: Building },
    ];
  };

  const menuItems = getMenuItems();

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
            EduSystem
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
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

export default Sidebar;
