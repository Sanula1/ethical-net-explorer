
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  School, 
  Users, 
  BookOpen, 
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  GraduationCap,
  User,
  UserCheck,
  UserPlus,
  Clock,
  Award,
  Building2,
  Target,
  Video
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Dashboard',
      roles: ['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_MANAGER']
    },
    {
      path: '/institutes',
      icon: School,
      label: 'Institutes',
      roles: ['SUPER_ADMIN', 'ORGANIZATION_MANAGER']
    },
    {
      path: '/classes',
      icon: Users,
      label: 'Classes',
      roles: ['TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/subjects',
      icon: BookOpen,
      label: 'Subjects',
      roles: ['TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/students',
      icon: GraduationCap,
      label: 'Students',
      roles: ['TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/teachers',
      icon: User,
      label: 'Teachers',
      roles: ['INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/parents',
      icon: UserPlus,
      label: 'Parents',
      roles: ['TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/users',
      icon: Users,
      label: 'Users',
      roles: ['SUPER_ADMIN']
    },
    {
      path: '/lectures',
      icon: Calendar,
      label: 'Lectures',
      roles: ['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/homework',
      icon: ClipboardList,
      label: 'Homework',
      roles: ['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/exams',
      icon: Award,
      label: 'Exams',
      roles: ['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/results',
      icon: BarChart3,
      label: 'Results',
      roles: ['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/attendance',
      icon: UserCheck,
      label: 'Attendance',
      roles: ['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/live-lectures',
      icon: Video,
      label: 'Live Lectures',
      roles: ['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/grading',
      icon: BarChart3,
      label: 'Grading',
      roles: ['TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/organizations',
      icon: Building2,
      label: 'Organizations',
      roles: ['SUPER_ADMIN', 'ORGANIZATION_MANAGER']
    },
    {
      path: '/causes',
      icon: Target,
      label: 'Causes',
      roles: ['ORGANIZATION_MANAGER']
    },
    {
      path: '/organization-lectures',
      icon: Video,
      label: 'Organization Lectures',
      roles: ['ORGANIZATION_MANAGER']
    },
    {
      path: '/gallery',
      icon: Award,
      label: 'Gallery',
      roles: ['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN']
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
      roles: ['STUDENT', 'TEACHER', 'INSTITUTE_ADMIN', 'SUPER_ADMIN', 'ORGANIZATION_MANAGER']
    }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          EduConnect
        </h2>
        
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
