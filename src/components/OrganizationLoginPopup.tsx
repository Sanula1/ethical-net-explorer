
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationApi } from '@/api/organization.api';

interface OrganizationLoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (loginResponse: any) => void;
}

const OrganizationLoginPopup = ({ isOpen, onClose, onLoginSuccess }: OrganizationLoginPopupProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

    setIsLoading(true);
    
    try {
      const loginResponse = await organizationApi.loginToOrganization({ email, password });
      
      // Store organization access token
      localStorage.setItem('org_access_token', loginResponse.access_token);
      
      onLoginSuccess(loginResponse);
      
      toast({
        title: "Login Successful",
        description: "Welcome to the organization portal",
      });
      
      // Reset form
      setEmail('');
      setPassword('');
      
    } catch (error) {
      console.error('Organization login error:', error);
      
      let errorMessage = "Login failed. Please check your credentials and try again.";
      if (error instanceof Error) {
        if (error.message.includes('HTTP Error: 401')) {
          errorMessage = "Invalid credentials. Please check your email and password.";
        } else if (error.message.includes('HTTP Error: 404')) {
          errorMessage = "API endpoint not found. Please verify the configuration.";
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

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <DialogTitle>Organization Login</DialogTitle>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Sign in to access your organization's portal
          </p>
          
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

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationLoginPopup;
