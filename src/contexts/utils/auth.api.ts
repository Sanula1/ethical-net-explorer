
import { LoginCredentials, ApiResponse, Institute } from '../types/auth.types';

export const getBaseUrl = () => {
  return localStorage.getItem('baseUrl') || '';
};

export const getBaseUrl2 = () => {
  return localStorage.getItem('baseUrl2') || '';
};

export const getApiHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };
};

export const loginUser = async (credentials: LoginCredentials): Promise<ApiResponse> => {
  // Check for Organization Manager mock login first
  if (credentials.email === 'orgmanager@company.com' || 
      credentials.email?.toLowerCase().includes('organization') ||
      credentials.password === 'orgmanager123') {
    
    // Mock Organization Manager response
    const mockResponse: ApiResponse = {
      access_token: 'mock-org-manager-token',
      refresh_token: 'mock-org-refresh-token',
      user: {
        id: 'org-001',
        firstName: 'Organization',
        lastName: 'Manager',
        name: 'Organization Manager',
        email: credentials.email,
        phone: '+1234567890',
        userType: 'OrganizationManager',
        dateOfBirth: '1980-01-01',
        gender: 'Not Specified',
        nic: '',
        birthCertificateNo: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        district: '',
        province: '',
        postalCode: '',
        country: '',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageUrl: '',
        role: 'OrganizationManager'
      }
    };
    
    // Add slight delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockResponse;
  }

  const baseUrl = getBaseUrl();
  console.log('Attempting login to:', `${baseUrl}/auth/login`);
  
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: getApiHeaders(),
    credentials: 'include', // Include cookies in request
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    console.error('Login failed:', response.status, response.statusText);
    throw new Error(`Login failed with status: ${response.status}`);
  }

  const loginData = await response.json();
  console.log('Login successful, received data:', loginData);
  
  // With HttpOnly cookies, we don't store the token manually
  // The server sets the cookie automatically
  
  return loginData;
};

export const fetchUserInstitutes = async (userId: string): Promise<Institute[]> => {
  // Mock organizations for Organization Manager
  if (userId === 'org-001') {
    const mockOrganizations = [
      {
        id: 'org-1',
        name: 'Education Network International',
        code: 'ENI',
        description: 'Global education network',
        isActive: true
      },
      {
        id: 'org-2', 
        name: 'Academic Solutions Group',
        code: 'ASG',
        description: 'Educational technology solutions',
        isActive: true
      },
      {
        id: 'org-3',
        name: 'Learning Excellence Corp',
        code: 'LEC', 
        description: 'Excellence in learning management',
        isActive: true
      }
    ];
    
    console.log('Fetched mock organizations for Organization Manager:', mockOrganizations);
    return mockOrganizations;
  }

  try {
    console.log(`Fetching institutes for user ${userId}...`);
    const baseUrl = getBaseUrl();
    
    const response = await fetch(`${baseUrl}/users/${userId}/institutes`, {
      method: 'GET',
      headers: getApiHeaders(),
      credentials: 'include' // Include cookies in request - HttpOnly cookie is sent automatically
    });

    if (response.ok) {
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const institutes = await response.json();
        console.log('Fetched institutes:', institutes);
        return Array.isArray(institutes) ? institutes : [];
      } else {
        console.error('Non-JSON response for institutes:', await response.text());
      }
    } else {
      console.error('Failed to fetch institutes:', response.status, response.statusText);
      
      if (response.status === 401) {
        console.warn('Unauthorized - HttpOnly cookie may be invalid or expired');
      }
    }
  } catch (error) {
    console.error('Error fetching user institutes:', error);
  }
  return [];
};

export const validateToken = async () => {
  const baseUrl = getBaseUrl();
  
  console.log('Validating session via HttpOnly cookie...');
  
  // Try multiple endpoints since /auth/me might not exist
  const endpoints = ['/auth/me', '/users/me', '/auth/validate'];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: getApiHeaders(),
        credentials: 'include' // Include cookies - HttpOnly cookie sent automatically
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Session validation successful:', userData);
        return userData;
      }
    } catch (error) {
      console.log(`Endpoint ${endpoint} failed:`, error);
    }
  }
  
  throw new Error('Session validation failed - no valid endpoint found');
};

export const logoutUser = async () => {
  try {
    const baseUrl = getBaseUrl();
    
    const response = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: getApiHeaders(),
      credentials: 'include' // Include cookies in request
    });
    
    if (response.ok) {
      console.log('Server logout successful - HttpOnly cookie cleared');
    } else {
      console.warn('Server logout failed, but proceeding with client logout');
    }
  } catch (error) {
    console.error('Error during server logout:', error);
  }
  
  // No need to clear localStorage since we're not storing tokens manually
  console.log('Logout complete');
};
