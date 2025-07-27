import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  Building2,
  Award,
  Video,
  Link,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const mainNavItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Building2, label: 'Organizations', path: '/organizations' },
    { icon: Video, label: 'Lectures', path: '/lectures' },
    { icon: Award, label: 'Causes', path: '/causes' },
  ];

  const instituteNavItems = [
    { icon: Building2, label: 'Institutes', path: '/institutes' },
    { icon: GraduationCap, label: 'Classes', path: '/classes' },
    { icon: BookOpen, label: 'Subjects', path: '/subjects' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Calendar, label: 'Attendance', path: '/attendance' },
    { icon: FileText, label: 'Homework', path: '/homework' },
    { icon: BarChart3, label: 'Exams', path: '/exams' },
    { icon: BarChart3, label: 'Results', path: '/results' },
    { icon: BarChart3, label: 'Grading', path: '/grading' },
  ];

  const organizationManagerItems = [
    { icon: Link, label: 'Assignment', path: '/organization-assignment' },
  ];

  const userSpecificItems = [
    { icon: Users, label: 'Students', path: '/students' },
    { icon: Users, label: 'Teachers', path: '/teachers' },
    { icon: Users, label: 'Parents', path: '/parents' },
    { icon: Users, label: 'Attendance Markers', path: '/attendance-markers' },
    { icon: Calendar, label: 'Attendance Marking', path: '/attendance-marking' },
    { icon: BarChart3, label: 'Grades', path: '/grades' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const NavItem = ({ icon: Icon, label, path, isSubItem = false }: { icon: any, label: string, path: string, isSubItem?: boolean }) => (
    <li>
      <NavLink
        to={path}
        className={({ isActive }) => cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
          isSubItem && 'ml-4',
          isCollapsed && !isSubItem && 'justify-center px-2'
        )}
        onClick={() => setIsMobileOpen(false)}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </NavLink>
    </li>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
            EduManage
          </h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="hidden lg:flex h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMobile}
          className="lg:hidden h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {/* Main Navigation - Always visible */}
          {!isCollapsed && (
            <li className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Main
            </li>
          )}
          {mainNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}

          {/* Organization Manager Specific Items */}
          {user?.role === 'OrganizationManager' && (
            <>
              {!isCollapsed && (
                <li className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-6">
                  Organization Management
                </li>
              )}
              {organizationManagerItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </>
          )}

          {/* Institute-specific items (for other roles) */}
          {user?.role !== 'OrganizationManager' && (
            <>
              {!isCollapsed && (
                <li className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-6">
                  Institute Management
                </li>
              )}
              {instituteNavItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}

              {!isCollapsed && (
                <li className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 mt-6">
                  User Management
                </li>
              )}
              {userSpecificItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </>
          )}
        </ul>
      </nav>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 p-0 bg-white dark:bg-gray-900 shadow-md"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out lg:translate-x-0',
        isCollapsed ? 'w-16' : 'w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
