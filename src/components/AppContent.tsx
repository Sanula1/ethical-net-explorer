import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import Login from './Login';
import Dashboard from './Dashboard';
import Organizations from './Organizations';
import Lectures from './Lectures';
import Causes from './Causes';
import OrganizationLectures from './OrganizationLectures';
import OrganizationAssignment from './OrganizationAssignment';
import Institutes from './Institutes';
import Classes from './Classes';
import Subjects from './Subjects';
import Users from './Users';
import Students from './Students';
import Teachers from './Teachers';
import Parents from './Parents';
import AttendanceMarkers from './AttendanceMarkers';
import Attendance from './Attendance';
import AttendanceMarking from './AttendanceMarking';
import Homework from './Homework';
import Exams from './Exams';
import Results from './Results';
import Grading from './Grading';
import Grades from './Grades';
import Settings from './Settings';
import Profile from './Profile';
import NotFound from '@/pages/NotFound';

const AppContent = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/lectures" element={user?.role === 'OrganizationManager' ? <OrganizationLectures /> : <Lectures />} />
            <Route path="/causes" element={<Causes />} />
            <Route path="/organization-assignment" element={<OrganizationAssignment />} />
            <Route path="/institutes" element={<Institutes />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/users" element={<Users />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/parents" element={<Parents />} />
            <Route path="/attendance-markers" element={<AttendanceMarkers />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance-marking" element={<AttendanceMarking />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/results" element={<Results />} />
            <Route path="/grading" element={<Grading />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AppContent;
