
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import Dashboard from './Dashboard';
import Login from './Login';
import Institutes from './Institutes';
import Classes from './Classes';
import Subjects from './Subjects';
import Students from './Students';
import Teachers from './Teachers';
import Parents from './Parents';
import Users from './Users';
import Lectures from './Lectures';
import Homework from './Homework';
import Exams from './Exams';
import Results from './Results';
import Attendance from './Attendance';
import LiveLectures from './LiveLectures';
import Grading from './Grading';
import Settings from './Settings';
import Profile from './Profile';
import Gallery from './Gallery';
import Organizations from './Organizations';
import OrganizationCauses from './OrganizationCauses';
import OrganizationLectures from './OrganizationLectures';

const AppContent = () => {
  const { user, login } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!user) {
    return <Login onLogin={login} loginFunction={login} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/institutes" element={<Institutes />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/parents" element={<Parents />} />
            <Route path="/users" element={<Users />} />
            <Route path="/lectures" element={<Lectures />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/results" element={<Results />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/live-lectures" element={<LiveLectures />} />
            <Route path="/grading" element={<Grading />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/causes" element={<OrganizationCauses />} />
            <Route path="/organization-lectures" element={<OrganizationLectures />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AppContent;
