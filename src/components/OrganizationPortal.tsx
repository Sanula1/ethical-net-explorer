
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Gallery from '@/components/Gallery';
import Profile from '@/components/Profile';
import Appearance from '@/components/Appearance';
import { Organization } from '@/api/organization.api';

interface OrganizationPortalProps {
  selectedOrganization: Organization;
  onBack: () => void;
}

const OrganizationPortal = ({ selectedOrganization, onBack }: OrganizationPortalProps) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('gallery');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  // Students component placeholder
  const StudentsComponent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage students in {selectedOrganization.name}</p>
        </div>
      </div>
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Students management coming soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This feature will allow you to manage students in your organization.
        </p>
      </div>
    </div>
  );

  // Courses component placeholder
  const CoursesComponent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground">Manage courses in {selectedOrganization.name}</p>
        </div>
      </div>
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Courses management coming soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This feature will allow you to manage courses in your organization.
        </p>
      </div>
    </div>
  );

  const renderComponent = () => {
    switch (currentPage) {
      case 'gallery':
        return <Gallery />;
      case 'students':
        return <StudentsComponent />;
      case 'courses':
        return <CoursesComponent />;
      case 'profile':
        return <Profile />;
      case 'appearance':
        return <Appearance />;
      default:
        return <Gallery />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex w-full h-screen">
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isOrganizationPortal={true}
          selectedOrganization={selectedOrganization}
          onBackToOrganizations={onBack}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header 
            onMenuClick={handleMenuClick}
            organizationName={selectedOrganization.name}
          />
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
            <div className="max-w-full">
              {renderComponent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrganizationPortal;
