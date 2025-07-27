
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft } from 'lucide-react';
import OrganizationLogin from './OrganizationLogin';
import OrganizationSelector from './OrganizationSelector';

const OrganizationPortal = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged into organization portal
  React.useEffect(() => {
    const orgToken = localStorage.getItem('org_access_token');
    setIsLoggedIn(!!orgToken);
  }, []);

  const handleLoginSuccess = (loginResponse: any) => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleBack = () => {
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('org_access_token');
    setIsLoggedIn(false);
  };

  if (showLogin) {
    return <OrganizationLogin onLogin={handleLoginSuccess} onBack={handleBack} />;
  }

  if (isLoggedIn) {
    return <OrganizationSelector onLogout={handleLogout} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Portal</h1>
          <p className="text-muted-foreground">
            Access your organization management portal
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowLogin(true)}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">Organization Login</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Sign in to your organization portal to manage organizations, courses, galleries, and students.
            </CardDescription>
            <Button className="w-full">
              Access Organization Portal
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-60">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-muted-foreground" />
              <CardTitle className="text-lg text-muted-foreground">Quick Access</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Additional organization management tools and shortcuts will be available here.
            </CardDescription>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationPortal;
