
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useToast } from "@/hooks/use-toast"
import { loginUser, validateToken, fetchUserInstitutes } from '@/contexts/utils/auth.api';
import { useAuth } from '@/contexts/AuthContext';
import { Institute } from '@/contexts/types/auth.types';
import Settings from '@/components/Settings';
import InstituteSelector from '@/components/InstituteSelector';
import OrganizationLogin from '@/components/OrganizationLogin';
import OrganizationSelector from '@/components/OrganizationSelector';
import CreateOrganizationForm from '@/components/forms/CreateOrganizationForm';
import { Organization } from '@/api/organization.api';
import { apiClient } from '@/api/client';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: any;
}

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'settings' | 'institute-selector' | 'organization-login' | 'organization-selector' | 'organization-dashboard' | 'create-organization'>('login');
  const { user, login, logout } = useAuth();
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const navigate = useNavigate();
  const [organizationLoginResponse, setOrganizationLoginResponse] = useState<any>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      validateAuthToken(accessToken);
    }
  }, []);

  const validateAuthToken = async (token: string) => {
    try {
      const userData = await validateToken();
      
      // Fetch user institutes after successful validation
      if (userData?.id && token) {
        const userInstitutes = await fetchUserInstitutes(userData.id, token);
        setInstitutes(userInstitutes);
        
        // If user has institutes, navigate to institute selector
        if (userInstitutes.length > 0) {
          setCurrentView('institute-selector');
        } else {
          toast({
            title: "Info",
            description: "No institutes found. Please contact your administrator.",
          });
        }
      } else {
        console.warn('User ID or token missing after validation');
      }
      
      navigate('/');
    } catch (error: any) {
      console.error('Token validation failed:', error.message);
      logout();
      navigate('/');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      await login({ email, password });

      // Fetch user institutes after successful login
      const accessToken = localStorage.getItem('access_token');
      if (user?.id && accessToken) {
        const userInstitutes = await fetchUserInstitutes(user.id, accessToken);
        setInstitutes(userInstitutes);
        
        // If user has institutes, navigate to institute selector
        if (userInstitutes.length > 0) {
          setCurrentView('institute-selector');
        } else {
          toast({
            title: "Info",
            description: "No institutes found. Please contact your administrator.",
          });
        }
      } else {
        console.warn('User ID or token missing after login');
      }

      toast({
        title: "Success",
        description: "Login successful!",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error.message);
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleInstituteSelect = (institute: Institute) => {
    setSelectedInstitute(institute);
    navigate('/dashboard');
  };

  const handleOrganizationLogin = (loginResponse: any) => {
    setOrganizationLoginResponse(loginResponse);
    setCurrentView('organization-selector');
  };

  const handleOrganizationSelect = (organization: Organization) => {
    setSelectedOrganization(organization);
    // Organization API calls will automatically use getBaseUrl2()
    setCurrentView('organization-dashboard');
  };

  const handleBackToLogin = () => {
    // Reset to main login and use baseUrl for institute API calls
    apiClient.setUseBaseUrl2(false);
    setCurrentView('login');
    setSelectedInstitute(null);
    setSelectedOrganization(null);
    setOrganizationLoginResponse(null);
  };

  const handleBackToOrganizationSelector = () => {
    setCurrentView('organization-selector');
    setSelectedOrganization(null);
  };

  const handleBackToOrganizationLogin = () => {
    setCurrentView('organization-login');
    setOrganizationLoginResponse(null);
  };

  const handleCreateOrganization = () => {
    setCurrentView('create-organization');
  };

  const handleOrganizationCreateSuccess = (organization: Organization) => {
    toast({
      title: "Success",
      description: `${organization.name} created successfully.`,
    });
    setCurrentView('organization-selector');
  };

  const renderLoginView = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Enter your credentials to access the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoginLoading}>
              {isLoginLoading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setCurrentView('organization-login')}>
              Login as Organization
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setCurrentView('settings')}>
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsView = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => setCurrentView('login')} className="mb-4">
          Back to Login
        </Button>
        <Settings />
      </div>
    </div>
  );

  const renderInstituteSelectorView = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Select Institute</h1>
          <p className="text-gray-600 dark:text-gray-400">Choose an institute to continue</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {institutes.map((institute) => (
            <Card
              key={institute.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleInstituteSelect(institute)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{institute.name}</CardTitle>
                <CardDescription>{institute.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Code: {institute.code}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      institute.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {institute.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {institutes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No institutes found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrganizationLoginView = () => (
    <OrganizationLogin
      onLogin={handleOrganizationLogin}
      onBack={handleBackToLogin}
    />
  );

  const renderOrganizationSelectorView = () => (
    <OrganizationSelector
      onOrganizationSelect={handleOrganizationSelect}
      onBack={handleBackToOrganizationLogin}
      onCreateOrganization={handleCreateOrganization}
    />
  );

  const renderCreateOrganizationForm = () => (
    <CreateOrganizationForm
      onSuccess={handleOrganizationCreateSuccess}
      onCancel={handleBackToOrganizationSelector}
    />
  );

  const renderOrganizationDashboard = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Organization Dashboard</CardTitle>
          <CardDescription>Welcome to the organization dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedOrganization && (
            <>
              <p>You are logged in as organization: {selectedOrganization.name}</p>
              <Button onClick={handleBackToOrganizationSelector}>Back to Organization Selector</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  let view;
  switch (currentView) {
    case 'login':
      view = renderLoginView();
      break;
    case 'settings':
      view = renderSettingsView();
      break;
    case 'institute-selector':
      view = renderInstituteSelectorView();
      break;
    case 'organization-login':
      view = renderOrganizationLoginView();
      break;
    case 'organization-selector':
      view = renderOrganizationSelectorView();
      break;
    case 'create-organization':
      view = renderCreateOrganizationForm();
      break;
    case 'organization-dashboard':
      view = renderOrganizationDashboard();
      break;
    default:
      view = renderLoginView();
  }

  return view;
};

export default Index;
