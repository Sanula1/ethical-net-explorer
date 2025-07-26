
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
import { loginUser, validateToken } from './utils/auth.api';
import { mapUserData } from './utils/user.utils';
import { instituteApi, Institute as ApiInstitute } from '@/api/institute.api';
import { cachedApiClient } from '@/api/cachedClient';
import { apiCache } from '@/utils/apiCache';

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

  const fetchUserInstitutes = async (userId: string, forceRefresh = false): Promise<Institute[]> => {
    try {
      console.log('Fetching user institutes with caching:', { userId, forceRefresh });
      
      // Use cached API client which handles proper base URL
      const apiInstitutes = await cachedApiClient.get<ApiInstitute[]>(
        `/users/${userId}/institutes`, 
        undefined, 
        { 
          forceRefresh,
          ttl: 60 // Cache for 1 hour since institutes don't change often
        }
      );
      
      // Map ApiInstitute to AuthContext Institute type
      return apiInstitutes.map((institute: ApiInstitute): Institute => ({
        id: institute.id,
        name: institute.name,
        code: institute.code,
        description: '', // Add default value for required field
        isActive: institute.isActive
      }));
    } catch (error) {
      console.error('Error fetching user institutes:', error);
      return [];
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      console.log('Starting login process...');
      const data = await loginUser(credentials);
      console.log('Login response received:', data);

      // Fetch user institutes with caching - don't force refresh on login
      const institutes = await fetchUserInstitutes(data.user.id, false);
      
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
    
    // Clear all cache when logging out
    apiCache.clearAllCache();
    
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

  // Method to refresh all data
  const refreshUserData = async (forceRefresh = true) => {
    if (!user) return;
    
    console.log('Refreshing user data...', { forceRefresh });
    setIsLoading(true);
    
    try {
      // Refresh institutes
      const institutes = await fetchUserInstitutes(user.id, forceRefresh);
      const mappedUser = mapUserData(user, institutes);
      setUser(mappedUser);
      
      // If there's a selected institute, refresh its data too
      if (currentInstituteId) {
        // Force refresh institute-specific data
        await cachedApiClient.get(
          `/institute-classes`,
          { instituteId: currentInstituteId },
          { forceRefresh: true, ttl: 30 }
        );
      }
      
      console.log('User data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      try {
        console.log('Validating existing token...');
        const data = await validateToken();
        
        // Don't force refresh on token validation - use cache if available
        const institutes = await fetchUserInstitutes(data.id, false);
        const mappedUser = mapUserData(data, institutes);
        setUser(mappedUser);
        console.log('Token validation successful, user restored');
      } catch (error) {
        console.error('Error validating token:', error);
        console.log('Clearing invalid session');
        logout();
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
    refreshUserData,
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
