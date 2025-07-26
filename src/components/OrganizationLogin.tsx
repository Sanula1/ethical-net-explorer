
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Eye, EyeOff, ArrowLeft, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationApi } from '@/api/organization.api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface OrganizationLoginProps {
  onLogin?: (loginResponse: any) => void;
  onBack?: () => void;
}

const OrganizationLogin = ({ onLogin, onBack }: OrganizationLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [baseUrl2, setBaseUrl2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing baseUrl2 from localStorage
    const existingBaseUrl2 = localStorage.getItem('baseUrl2');
    if (existingBaseUrl2) {
      setBaseUrl2(existingBaseUrl2);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    if (!baseUrl2) {
      toast({
        title: "Configuration Error",
        description: "Please set the organization API base URL",
        variant: "destructive",
      });
      return;
    }

    // Save baseUrl2 to localStorage
    localStorage.setItem('baseUrl2', baseUrl2);

    setIsLoading(true);
    
    try {
      const loginResponse = await organizationApi.loginToOrganization({ email, password });
      
      // Store organization access token
      localStorage.setItem('org_access_token', loginResponse.access_token);
      
      if (onLogin) {
        onLogin(loginResponse);
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome to the organization portal",
      });
    } catch (error) {
      console.error('Organization login error:', error);
      
      let errorMessage = "Login failed. Please check your credentials and try again.";
      if (error instanceof Error) {
        if (error.message.includes('Mixed Content') || error.message.includes('Failed to fetch')) {
          errorMessage = "Network error. Please check the API URL and ensure it uses HTTPS.";
        } else if (error.message.includes('Organization base URL not configured')) {
          errorMessage = "Please configure the organization API base URL.";
        }
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center justify-center flex-1">
              <Building2 className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Organization Login</CardTitle>
          <CardDescription>
            Sign in to access your organization's portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm text-muted-foreground"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced Settings
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="baseUrl2">Organization API Base URL</Label>
                  <Input
                    id="baseUrl2"
                    type="url"
                    placeholder="https://your-org-api.com"
                    value={baseUrl2}
                    onChange={(e) => setBaseUrl2(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The base URL for your organization's API endpoint
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationLogin;
