
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  User, 
  Institute, 
  Class, 
  Subject, 
  Child, 
  Organization,
  LoginCredentials, 
  AuthContextType 
} from './types/auth.types';
import { loginUser, fetchUserInstitutes, validateToken } from './utils/auth.api';
import { mapUserData } from './utils/user.utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedInstitute, setSelectedInstituteState] = useState<Institute | null>(null);
  const [selectedClass, setSelectedClassState] = useState<Class | null>(null);
  const [selectedSubject, setSelectedSubjectState] = useState<Subject | null>(null);
  const [selectedChild, setSelectedChildState] = useState<Child | null>(null);
  const [selectedOrganization, setSelectedOrganizationState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Public variables for current IDs
  const [currentInstituteId, setCurrentInstituteId] = useState<string | null>(null);
  const [currentClassId, setCurrentClassId] = useState<string | null>(null);
  const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const [currentOrganizationId, setCurrentOrganizationId] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      console.log('Starting login process...');
      const data = await loginUser(credentials);
      console.log('Login response received:', data);

      // Handle JWT token structure
      if (data.access_token) {
        console.log('Storing JWT access token');
        localStorage.setItem('access_token', data.access_token);
        
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
      } else {
        console.error('No access_token in login response');
        throw new Error('Invalid login response - no access token received');
      }

      // Fetch user institutes with the new token
      const institutes = await fetchUserInstitutes(data.user.id, data.access_token);
      
      const mappedUser = mapUserData(data.user, institutes);
      console.log('User mapped successfully:', mappedUser);
      setUser(mappedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user...');
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setSelectedInstituteState(null);
    setSelectedClassState(null);
    setSelectedSubjectState(null);
    setSelectedChildState(null);
    setCurrentInstituteId(null);
    setCurrentClassId(null);
    setCurrentSubjectId(null);
    setCurrentChildId(null);
    setSelectedOrganizationState(null);
    setCurrentOrganizationId(null);
    console.log('User logged out successfully');
  };

  const setSelectedInstitute = (institute: Institute | null) => {
    setSelectedInstituteState(institute);
    setCurrentInstituteId(institute?.id || null);
    
    // Clear class and subject when institute changes
    setSelectedClassState(null);
    setSelectedSubjectState(null);
    setCurrentClassId(null);
    setCurrentSubjectId(null);
  };

  const setSelectedClass = (classData: Class | null) => {
    setSelectedClassState(classData);
    setCurrentClassId(classData?.id || null);
    
    // Clear subject when class changes
    setSelectedSubjectState(null);
    setCurrentSubjectId(null);
  };

  const setSelectedSubject = (subject: Subject | null) => {
    setSelectedSubjectState(subject);
    setCurrentSubjectId(subject?.id || null);
  };

  const setSelectedChild = (child: Child | null) => {
    setSelectedChildState(child);
    setCurrentChildId(child?.id || null);
  };

  const setSelectedOrganization = (organization: Organization | null) => {
    setSelectedOrganizationState(organization);
    setCurrentOrganizationId(organization?.id || null);
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          console.log('Validating existing token...');
          const data = await validateToken();
          const institutes = await fetchUserInstitutes(data.id, token);
          const mappedUser = mapUserData(data, institutes);
          setUser(mappedUser);
          console.log('Token validation successful, user restored');
        } catch (error) {
          console.error('Error validating token:', error);
          console.log('Clearing invalid token');
          logout();
        }
      } else {
        console.log('No token found in localStorage');
      }
      setIsInitialized(true);
    };

    checkToken();
  }, []);

  const value = {
    user,
    selectedInstitute,
    selectedClass,
    selectedSubject,
    selectedChild,
    selectedOrganization,
    currentInstituteId,
    currentClassId,
    currentSubjectId,
    currentChildId,
    currentOrganizationId,
    login,
    logout,
    setSelectedInstitute,
    setSelectedClass,
    setSelectedSubject,
    setSelectedChild,
    setSelectedOrganization,
    isLoading
  };

  // Don't render children until context is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Re-export types for backward compatibility
export type { User, UserRole } from './types/auth.types';
