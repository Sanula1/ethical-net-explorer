
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface InstituteLoginProps {
  onBack: () => void;
}

const InstituteLogin = ({ onBack }: InstituteLoginProps) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    instituteCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { selectedOrganization } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Mock institute login process
      // In real implementation, this would make API call to institute-specific login endpoint
      console.log('Institute login attempt:', credentials);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login response with JWT token
      const mockInstituteToken = 'institute-jwt-token-' + Date.now();
      localStorage.setItem('institute_access_token', mockInstituteToken);
      
      // Here you would typically:
      // 1. Make API call to institute login endpoint
      // 2. Receive JWT token specific to the institute
      // 3. Update auth context with institute-specific user data
      
      console.log('Institute login successful');
      
    } catch (err) {
      setError('Failed to login to institute. Please check your credentials.');
      console.error('Institute login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Institute Login
            </CardTitle>
            <CardDescription className="mt-2">
              Login to access {selectedOrganization?.name} institute services
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50 text-red-700">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instituteCode" className="text-sm font-medium">
                Institute Code
              </Label>
              <Input
                id="instituteCode"
                name="instituteCode"
                type="text"
                placeholder="Enter institute code"
                value={credentials.instituteCode}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={credentials.email}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login to Institute'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help? Contact your institute administrator
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstituteLogin;
