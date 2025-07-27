
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import NotFound from '@/pages/NotFound';
import Users from '@/components/Users';
import Students from '@/components/Students';
import Parents from '@/components/Parents';
import Teachers from '@/components/Teachers';
import Classes from '@/components/Classes';
import Subjects from '@/components/Subjects';
import Institutes from '@/components/Institutes';
import Attendance from '@/components/Attendance';
import AttendanceMarking from '@/components/AttendanceMarking';
import AttendanceMarkers from '@/components/AttendanceMarkers';
import QRAttendance from '@/components/QRAttendance';
import Grading from '@/components/Grading';
import Homework from '@/components/Homework';
import Exams from '@/components/Exams';
import Results from '@/components/Results';
import Settings from '@/components/Settings';
import Profile from '@/components/Profile';
import InstituteSelector from '@/components/InstituteSelector';
import ClassSelector from '@/components/ClassSelector';
import SubjectSelector from '@/components/SubjectSelector';
import ParentChildrenSelector from '@/components/ParentChildrenSelector';
import InstituteDetails from '@/components/InstituteDetails';
import Appearance from '@/components/Appearance';
import Lectures from '@/components/Lectures';
import LiveLectures from '@/components/LiveLectures';
import Organizations from '@/components/Organizations';
import OrganizationSelector from '@/components/OrganizationSelector';
import OrganizationLogin from '@/components/OrganizationLogin';
import OrganizationDashboard from '@/components/OrganizationDashboard';
import OrganizationCauses from '@/components/OrganizationCauses';

const AppContent = () => {
  const { user, login } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  if (!user) {
    return <Login onLogin={() => {}} loginFunction={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={handleMenuClick} />
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/students" element={<Students />} />
              <Route path="/parents" element={<Parents />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/institutes" element={<Institutes />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance-marking" element={<AttendanceMarking />} />
              <Route path="/attendance-markers" element={<AttendanceMarkers />} />
              <Route path="/qr-attendance" element={<QRAttendance />} />
              <Route path="/grading" element={<Grading />} />
              <Route path="/homework" element={<Homework />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/results" element={<Results />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/select-institute" element={<InstituteSelector />} />
              <Route path="/select-class" element={<ClassSelector />} />
              <Route path="/select-subject" element={<SubjectSelector />} />
              <Route path="/select-children" element={<ParentChildrenSelector />} />
              <Route path="/institute-details" element={<InstituteDetails />} />
              <Route path="/appearance" element={<Appearance />} />
              <Route path="/lectures" element={<Lectures />} />
              <Route path="/live-lectures" element={<LiveLectures />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/organization-selector" element={<OrganizationSelector />} />
              <Route path="/organization-login" element={<OrganizationLogin onLogin={() => {}} onBack={() => {}} />} />
              <Route path="/organization-dashboard" element={<OrganizationDashboard organization={{}} onBack={() => {}} currentPage={currentPage} onPageChange={handlePageChange} />} />
              <Route path="/causes" element={<OrganizationCauses />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppContent;
