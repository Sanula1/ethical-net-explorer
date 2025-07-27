import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/Dashboard';
import Users from '@/components/Users';
import Students from '@/components/Students';
import Teachers from '@/components/Teachers';
import Parents from '@/components/Parents';
import Grades from '@/components/Grades';
import Classes from '@/components/Classes';
import Subjects from '@/components/Subjects';
import Institutes from '@/components/Institutes';
import Grading from '@/components/Grading';
import Attendance from '@/components/Attendance';
import AttendanceMarking from '@/components/AttendanceMarking';
import AttendanceMarkers from '@/components/AttendanceMarkers';
import QRAttendance from '@/components/QRAttendance';
import Lectures from '@/components/Lectures';
import LiveLectures from '@/components/LiveLectures';
import Homework from '@/components/Homework';
import Exams from '@/components/Exams';
import Results from '@/components/Results';
import Profile from '@/components/Profile';
import InstituteDetails from '@/components/InstituteDetails';
import Login from '@/components/Login';
import InstituteSelector from '@/components/InstituteSelector';
import ClassSelector from '@/components/ClassSelector';
import SubjectSelector from '@/components/SubjectSelector';
import ParentChildrenSelector from '@/components/ParentChildrenSelector';
import Organizations from '@/components/Organizations';
import Gallery from '@/components/Gallery';
import Settings from '@/components/Settings';
import Appearance from '@/components/Appearance';
import OrganizationHeader from '@/components/OrganizationHeader';
import OrganizationLogin from '@/components/OrganizationLogin';
import OrganizationSelector from '@/components/OrganizationSelector';
import OrganizationDashboard from '@/components/OrganizationDashboard';
import OrganizationSidebar from '@/components/OrganizationSidebar';
import CreateOrganizationForm from '@/components/forms/CreateOrganizationForm';
import Courses from '@/components/Courses';

const AppContent = () => {
  const { user, login, selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization, setSelectedOrganization } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [organizationLoginData, setOrganizationLoginData] = useState<any>(null);
  const [showCreateOrgForm, setShowCreateOrgForm] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleOrganizationLogin = (loginResponse: any) => {
    console.log('Organization login successful:', loginResponse);
    setOrganizationLoginData(loginResponse);
    setCurrentPage('organizations');
  };

  const handleOrganizationSelect = (organization: any) => {
    console.log('Organization selected:', organization);
    setSelectedOrganization(organization);
    
    // Switch to using baseUrl2 for organization-specific API calls
    import('@/api/client').then(({ apiClient }) => {
      apiClient.setUseBaseUrl2(true);
    });
    
    setCurrentPage('organization');
  };

  const handleBackToOrganizationLogin = () => {
    setOrganizationLoginData(null);
    setCurrentPage('organizations');
  };

  const handleBackToOrganizationSelector = () => {
    setSelectedOrganization(null);
    setCurrentPage('organizations');
  };

  const handleBackToMain = () => {
    setOrganizationLoginData(null);
    setSelectedOrganization(null);
    
    // Switch back to using baseUrl for main API calls
    import('@/api/client').then(({ apiClient }) => {
      apiClient.setUseBaseUrl2(false);
    });
    
    setCurrentPage('dashboard');
  };

  const handleCreateOrganization = () => {
    setShowCreateOrgForm(true);
  };

  const handleCreateOrganizationSuccess = (organization: any) => {
    console.log('Organization created successfully:', organization);
    setShowCreateOrgForm(false);
    setCurrentPage('organizations');
  };

  const handleCreateOrganizationCancel = () => {
    setShowCreateOrgForm(false);
    setCurrentPage('organizations');
  };

  const renderComponent = () => {
    // For Organization Manager - handle organization flow
    if (user?.role === 'OrganizationManager') {
      // Handle create organization form
      if (showCreateOrgForm) {
        return (
          <CreateOrganizationForm
            onSuccess={handleCreateOrganizationSuccess}
            onCancel={handleCreateOrganizationCancel}
          />
        );
      }

      // Handle organizations page
      if (currentPage === 'organizations') {
        // If not logged into organization system, show login
        if (!organizationLoginData) {
          return (
            <OrganizationLogin
              onLogin={handleOrganizationLogin}
              onBack={handleBackToMain}
            />
          );
        }
        
        // If logged in but no organization selected, show selector
        if (!selectedOrganization) {
          return (
            <OrganizationSelector
              onOrganizationSelect={handleOrganizationSelect}
              onBack={handleBackToOrganizationLogin}
              onCreateOrganization={handleCreateOrganization}
              userPermissions={organizationLoginData?.permissions}
            />
          );
        }
      }

      // If organization is selected, show organization dashboard with sidebar
      if (selectedOrganization) {
        return (
          <div className="flex h-screen">
            <OrganizationSidebar
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              organization={selectedOrganization}
              onBack={handleBackToOrganizationSelector}
            />
            <div className="flex-1 overflow-auto">
              <OrganizationDashboard
                organization={selectedOrganization}
                onBack={handleBackToOrganizationSelector}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        );
      }

      // For OrganizationManager, handle basic pages
      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'courses':
          return <Courses />;
        case 'profile':
          return <Profile />;
        case 'appearance':
          return <Appearance />;
        default:
          return <Dashboard />;
      }
    }

    // System Admin doesn't need institute/class/subject selection flow
    if (user?.role === 'SystemAdmin') {
      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'users':
          return <Users />;
        case 'students':
          return <Students />;
        case 'teachers':
          return <Teachers />;
        case 'parents':
          return <Parents />;
        case 'grades':
          return <Grades />;
        case 'classes':
          return <Classes apiLevel="institute" />;
        case 'subjects':
          return <Subjects apiLevel="institute" />;
        case 'institutes':
          return <Institutes />;
        case 'grading':
        case 'grades-table':
        case 'create-grade':
        case 'assign-grade-classes':
        case 'view-grade-classes':
          return <Grading />;
        case 'attendance':
          return <Attendance />;
        case 'attendance-marking':
          return <AttendanceMarking onNavigate={setCurrentPage} />;
        case 'attendance-markers':
          return <AttendanceMarkers />;
        case 'qr-attendance':
          return <QRAttendance />;
        case 'lectures':
          return <Lectures />;
        case 'live-lectures':
          return <LiveLectures />;
        case 'homework':
          return <Homework />;
        case 'exams':
          return <Exams />;
        case 'results':
          return <Results />;
        case 'profile':
          return <Profile />;
        case 'institute-details':
          return <InstituteDetails />;
        case 'appearance':
          return <Appearance />;
        default:
          return <Dashboard />;
      }
    }

    // For Student role - simplified interface
    if (user?.role === 'Student') {
      if (!selectedInstitute && user.institutes.length === 1) {
        // Auto-select the only institute available
        // This should be handled by the auth context
      }
      
      if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'attendance':
          return <Attendance />;
        case 'lectures':
          return <Lectures />;
        case 'homework':
          return <Homework />;
        case 'exams':
          return <Exams />;
        case 'results':
          return <Results />;
        case 'profile':
          return <Profile />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'appearance':
          return <Appearance />;
        default:
          return <Dashboard />;
      }
    }

    // For Parent role
    if (user?.role === 'Parent') {
      if (currentPage === 'parent-children') {
        return <ParentChildrenSelector />;
      }

      if (!selectedChild && currentPage !== 'parent-children' && currentPage !== 'profile') {
        return <ParentChildrenSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'attendance':
          return <Attendance />;
        case 'homework':
          return <Homework />;
        case 'results':
          return <Results />;
        case 'exams':
          return <Exams />;
        case 'profile':
          return <Profile />;
        case 'parent-children':
          return <ParentChildrenSelector />;
        case 'appearance':
          return <Appearance />;
        default:
          return <ParentChildrenSelector />;
      }
    }

    // For Teacher role
    if (user?.role === 'Teacher') {
      if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      if (currentPage === 'select-class') {
        return <ClassSelector />;
      }

      if (currentPage === 'select-subject') {
        return <SubjectSelector />;
      }

      const classRequiredPages = ['attendance-marking', 'grading'];
      if (selectedInstitute && !selectedClass && classRequiredPages.includes(currentPage)) {
        return <ClassSelector />;
      }

      const subjectRequiredPages = ['lectures'];
      if (selectedClass && !selectedSubject && subjectRequiredPages.includes(currentPage)) {
        return <SubjectSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'students':
          return <Students />;
        case 'parents':
          return <Parents />;
        case 'classes':
          return <Classes apiLevel="institute" />;
        case 'subjects':
          return <Subjects apiLevel={selectedClass ? "class" : "institute"} />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'grading':
        case 'grades-table':
        case 'create-grade':
        case 'assign-grade-classes':
        case 'view-grade-classes':
          return <Grading />;
        case 'attendance':
          return <Attendance />;
        case 'attendance-marking':
          return <AttendanceMarking onNavigate={setCurrentPage} />;
        case 'lectures':
          return <Lectures />;
        case 'homework':
          return <Homework />;
        case 'exams':
          return <Exams />;
        case 'results':
          return <Results />;
        case 'profile':
          return <Profile />;
        case 'appearance':
          return <Appearance />;
        default:
          return <Dashboard />;
      }
    }

    // For AttendanceMarker role
    if (user?.role === 'AttendanceMarker') {
      if (!selectedInstitute && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      if (!selectedClass && currentPage !== 'select-class') {
        return <ClassSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'attendance-marking':
          return <AttendanceMarking onNavigate={setCurrentPage} />;
        case 'qr-attendance':
          return <QRAttendance />;
        case 'profile':
          return <Profile />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'select-class':
          return <ClassSelector />;
        case 'appearance':
          return <Appearance />;
        default:
          return <AttendanceMarking onNavigate={setCurrentPage} />;
      }
    }

    // For InstituteAdmin and other roles - full access within their institute
    if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
      return <InstituteSelector />;
    }

    if (currentPage === 'select-class') {
      return <ClassSelector />;
    }

    if (currentPage === 'select-subject') {
      return <SubjectSelector />;
    }

    const classRequiredPages = ['attendance-marking', 'grading'];
    if (selectedInstitute && !selectedClass && classRequiredPages.includes(currentPage)) {
      return <ClassSelector />;
    }

    const subjectRequiredPages = ['lectures'];
    if (selectedClass && !selectedSubject && subjectRequiredPages.includes(currentPage)) {
      return <SubjectSelector />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'students':
        return <Students />;
      case 'teachers':
        return <Teachers />;
      case 'parents':
        return <Parents />;
      case 'grades':
        return <Grades />;
      case 'classes':
        return <Classes apiLevel="institute" />;
      case 'subjects':
        return <Subjects apiLevel={selectedClass ? "class" : "institute"} />;
      case 'institutes':
        return <Institutes />;
      case 'select-institute':
        return <InstituteSelector />;
      case 'grading':
      case 'grades-table':
      case 'create-grade':
      case 'assign-grade-classes':
      case 'view-grade-classes':
        return <Grading />;
      case 'attendance':
        return <Attendance />;
      case 'attendance-marking':
        return <AttendanceMarking onNavigate={setCurrentPage} />;
      case 'attendance-markers':
        return <AttendanceMarkers />;
      case 'qr-attendance':
        return <QRAttendance />;
      case 'lectures':
        return <Lectures />;
      case 'live-lectures':
        return <LiveLectures />;
      case 'homework':
        return <Homework />;
      case 'exams':
        return <Exams />;
      case 'results':
        return <Results />;
      case 'profile':
        return <Profile />;
      case 'institute-details':
        return <InstituteDetails />;
      case 'appearance':
        return <Appearance />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={login} loginFunction={login} />;
  }

  // If OrganizationManager has selected an organization, render without main layout
  if (user?.role === 'OrganizationManager' && selectedOrganization) {
    return renderComponent();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex w-full h-screen">
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header onMenuClick={handleMenuClick} />
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

export default AppContent;
