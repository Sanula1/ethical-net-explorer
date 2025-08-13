
import React, { useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import AppContent from '@/components/AppContent';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <AuthProvider>
      <AppContent 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
      />
    </AuthProvider>
  );
};

export default Index;
