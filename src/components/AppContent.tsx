import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import OrganizationLogin from '@/components/OrganizationLogin';
import { OrganizationSelector } from '@/components/OrganizationSelector';
import CreateOrganizationForm from '@/components/forms/CreateOrganizationForm';
import Dashboard from './Dashboard';

const AppContent = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOrganizationLogin, setShowOrganizationLogin] = useState(false);
  const [showCreateOrganization, setShowCreateOrganization] = useState(false);
  const [isLoggedIntoOrg, setIsLoggedIntoOrg] = useState(!!localStorage.getItem('org_access_token'));

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOrganizationLogin = (loginResponse: any) => {
    setIsLoggedIntoOrg(true);
    setShowOrganizationLogin(false);
    
    // For InstituteAdmin, Student, Teacher roles - go to select organization
    if (user?.role === 'InstituteAdmin' || user?.role === 'Student' || user?.role === 'Teacher') {
      setCurrentPage('select-organization');
    } else {
      // For OrganizationManager - go to organizations page
      setCurrentPage('organizations');
    }
  };

  const handleBackFromOrganizationLogin = () => {
    setShowOrganizationLogin(false);
    setCurrentPage('organizations');
  };

  const handleCreateOrganization = () => {
    setShowCreateOrganization(true);
  };

  const handleCreateOrganizationSuccess = () => {
    setShowCreateOrganization(false);
    setCurrentPage('organizations');
  };

  const handleCreateOrganizationCancel = () => {
    setShowCreateOrganization(false);
  };

  const handlePageChange = (page: string) => {
    if (page === 'organizations') {
      // Check if user needs to login to organization system
      if ((user?.role === 'InstituteAdmin' || user?.role === 'Student' || user?.role === 'Teacher' || user?.role === 'OrganizationManager') && !isLoggedIntoOrg) {
        setShowOrganizationLogin(true);
        return;
      }
    }
    setCurrentPage(page);
  };

  // Show organization login form
  if (showOrganizationLogin) {
    return (
      <OrganizationLogin 
        onLogin={handleOrganizationLogin}
        onBack={handleBackFromOrganizationLogin}
      />
    );
  }

  // Show create organization form
  if (showCreateOrganization) {
    return (
      <CreateOrganizationForm 
        onSuccess={handleCreateOrganizationSuccess}
        onCancel={handleCreateOrganizationCancel}
      />
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'organizations':
        return (
          <OrganizationSelector 
            onCreateClick={user?.role === 'OrganizationManager' ? handleCreateOrganization : undefined}
          />
        );
      case 'select-organization':
        return <OrganizationSelector />;
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <div>Users</div>;
      case 'students':
        return <div>Students</div>;
      case 'parents':
        return <div>Parents</div>;
      case 'teachers':
        return <div>Teachers</div>;
      case 'classes':
        return <div>Classes</div>;
      case 'subjects':
        return <div>Subjects</div>;
      case 'select-class':
        return <div>Select Class</div>;
      case 'select-subject':
        return <div>Select Subject</div>;
      case 'institutes':
        return <div>Institutes</div>;
      case 'attendance':
        return <div>Attendance</div>;
      case 'attendance-marking':
        return <div>Attendance Marking</div>;
      case 'attendance-markers':
        return <div>Attendance Markers</div>;
      case 'qr-attendance':
        return <div>QR Attendance</div>;
      case 'courses':
        return <div>Courses</div>;
      case 'create-course':
        return <div>Create Course</div>;
      case 'course-materials':
        return <div>Course Materials</div>;
      case 'lectures':
        return <div>Lectures</div>;
      case 'live-lectures':
        return <div>Live Lectures</div>;
      case 'create-lecture':
        return <div>Create Lecture</div>;
      case 'causes':
        return <div>Causes</div>;
      case 'create-cause':
        return <div>Create Cause</div>;
      case 'cause-materials':
        return <div>Cause Materials</div>;
      case 'grading':
        return <div>Grading</div>;
      case 'homework':
        return <div>Homework</div>;
      case 'exams':
        return <div>Exams</div>;
      case 'results':
        return <div>Results</div>;
      case 'profile':
        return <div>Profile</div>;
      case 'appearance':
        return <div>Appearance</div>;
      case 'institute-details':
        return <div>Institute Details</div>;
      case 'settings':
        return <div>Settings</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          onSidebarToggle={handleSidebarToggle}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          showOrganizationHeader={false}
        />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AppContent;
