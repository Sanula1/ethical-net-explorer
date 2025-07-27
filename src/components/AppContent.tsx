import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Institutes from '@/components/Institutes';
import Classes from '@/components/Classes';
import Subjects from '@/components/Subjects';
import Lectures from '@/components/Lectures';
import Homework from '@/components/Homework';
import Exams from '@/components/Exams';
import Results from '@/components/Results';
import Users from '@/components/Users';
import Teachers from '@/components/Teachers';
import Students from '@/components/Students';
import Parents from '@/components/Parents';
import AttendanceMarkers from '@/components/AttendanceMarkers';
import Profile from '@/components/Profile';
import Appearance from '@/components/Appearance';
import Settings from '@/components/Settings';
import Organizations from '@/components/Organizations';
import OrganizationLogin from '@/components/OrganizationLogin';
import OrganizationSidebar from '@/components/OrganizationSidebar';
import OrganizationDashboard from '@/components/OrganizationDashboard';
import OrganizationManagerSidebar from '@/components/OrganizationManagerSidebar';
import OrganizationManagerDashboard from '@/components/OrganizationManagerDashboard';

const AppContent = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOrganizationLoginOpen, setIsOrganizationLoginOpen] = useState(false);
  const [organizationLoginData, setOrganizationLoginData] = useState(null);
  const [isOrganizationDashboardOpen, setIsOrganizationDashboardOpen] = useState(false);

  const handleOrganizationLogin = (loginData: any) => {
    setOrganizationLoginData(loginData);
    setIsOrganizationLoginOpen(false);
    
    // For OrganizationManager, show organization management dashboard
    if (user?.role === 'OrganizationManager') {
      setIsOrganizationDashboardOpen(true);
      setCurrentPage('select-organizations');
    } else {
      // For other roles, show the regular organization dashboard
      setIsOrganizationDashboardOpen(true);
      setCurrentPage('organization');
    }
  };

  const handleBackFromOrganizationLogin = () => {
    setIsOrganizationLoginOpen(false);
  };

  const handleBackFromOrganizationDashboard = () => {
    setIsOrganizationDashboardOpen(false);
    setOrganizationLoginData(null);
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page: string) => {
    if (page === 'organizations') {
      setIsOrganizationLoginOpen(true);
    } else {
      setCurrentPage(page);
    }
  };

  const renderContent = () => {
    if (isOrganizationLoginOpen) {
      return (
        <OrganizationLogin
          onLogin={handleOrganizationLogin}
          onBack={handleBackFromOrganizationLogin}
        />
      );
    }

    if (isOrganizationDashboardOpen) {
      // For OrganizationManager, show the organization management dashboard
      if (user?.role === 'OrganizationManager') {
        return (
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <OrganizationManagerSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onBack={handleBackFromOrganizationDashboard}
            />
            <div className="flex-1 flex flex-col">
              <Header 
                onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                showOrganizationHeader={true}
              />
              <main className="flex-1">
                <OrganizationManagerDashboard
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </main>
            </div>
          </div>
        );
      } else {
        // For other roles, show the regular organization dashboard
        return (
          <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <OrganizationSidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              organization={organizationLoginData}
              onBack={handleBackFromOrganizationDashboard}
            />
            <div className="flex-1 flex flex-col">
              <Header 
                onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                showOrganizationHeader={true}
              />
              <main className="flex-1">
                <OrganizationDashboard
                  organization={organizationLoginData}
                  onBack={handleBackFromOrganizationDashboard}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </main>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <div className="flex-1 flex flex-col">
          <Header 
            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            showOrganizationHeader={false}
          />
          <main className="flex-1">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'institutes' && <Institutes />}
            {currentPage === 'classes' && <Classes />}
            {currentPage === 'subjects' && <Subjects />}
            {currentPage === 'lectures' && <Lectures />}
            {currentPage === 'homework' && <Homework />}
            {currentPage === 'exams' && <Exams />}
            {currentPage === 'results' && <Results />}
            {currentPage === 'users' && <Users />}
            {currentPage === 'teachers' && <Teachers />}
            {currentPage === 'students' && <Students />}
            {currentPage === 'parents' && <Parents />}
            {currentPage === 'attendance-markers' && <AttendanceMarkers />}
            {currentPage === 'profile' && <Profile />}
            {currentPage === 'appearance' && <Appearance />}
            {currentPage === 'settings' && <Settings />}
            {currentPage === 'select-institute' && <div>Select Institute Content</div>}
            {currentPage === 'organizations' && <Organizations />}
          </main>
        </div>
      </div>
    );
  };

  return renderContent();
};

export default AppContent;
