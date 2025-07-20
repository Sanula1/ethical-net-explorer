
import { LoginCredentials, ApiResponse, Institute } from '../types/auth.types';

export const getBaseUrl = () => {
  return localStorage.getItem('baseUrl') || '';
};

export const getApiHeaders = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.warn('No access token found for API headers');
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
  }
  
  console.log('Adding bearer token to API headers');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
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
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    console.error('Login failed:', response.status, response.statusText);
    throw new Error(`Login failed with status: ${response.status}`);
  }

  const loginData = await response.json();
  console.log('Login successful, received data:', loginData);
  
  // Handle JWT token response structure
  if (loginData.access_token) {
    console.log('JWT access token received:', loginData.access_token);
    
    // Store the JWT token securely
    localStorage.setItem('access_token', loginData.access_token);
    
    if (loginData.refresh_token) {
      localStorage.setItem('refresh_token', loginData.refresh_token);
      console.log('Refresh token stored');
    }
  } else {
    console.warn('No access_token in login response');
  }

  return loginData;
};

export const fetchUserInstitutes = async (userId: string, accessToken: string): Promise<Institute[]> => {
  // Mock organizations for Organization Manager
  if (userId === 'org-001' || accessToken === 'mock-org-manager-token') {
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
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
    
    console.log('Request headers for institutes:', headers);
    
    const response = await fetch(`${baseUrl}/users/${userId}/institutes`, {
      headers
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
        console.warn('Unauthorized - token may be invalid');
      }
    }
  } catch (error) {
    console.error('Error fetching user institutes:', error);
  }
  return [];
};

export const validateToken = async () => {
  const baseUrl = getBaseUrl();
  const headers = getApiHeaders();
  
  console.log('Validating token with headers:', headers);
  
  const response = await fetch(`${baseUrl}/auth/me`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    console.error('Token validation failed:', response.status, response.statusText);
    throw new Error(`Token validation failed with status: ${response.status}`);
  }

  const userData = await response.json();
  console.log('Token validation successful:', userData);
  return userData;
};
