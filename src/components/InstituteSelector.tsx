
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Users, CheckCircle, RefreshCw, MapPin, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface InstituteData {
  instituteUserId: string;
  userType: string;
  UserIdByInstitute: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  institute: {
    id: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    imageUrl: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: string;
    dateOfBirth: string;
    gender: string;
    nic: string;
    birthCertificateNo: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    district: string;
    province: string;
    postalCode: string;
    country: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    imageUrl: string;
  };
}

const InstituteSelector = () => {
  const { user, setSelectedInstitute } = useAuth();
  const { toast } = useToast();
  const [institutes, setInstitutes] = useState<InstituteData[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  const getAuthToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No authentication token found in localStorage');
      toast({
        title: "Authentication Error",
        description: "No authentication token found. Please login again.",
        variant: "destructive"
      });
      return null;
    }
    return token;
  };

  const getApiHeaders = () => {
    const token = getAuthToken();
    if (!token) return null;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const handleLoadInstitutes = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    setIsLoading(true);
    console.log('Loading user institutes...');
    
    const headers = getApiHeaders();
    if (!headers) {
      setIsLoading(false);
      return;
    }

    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/users/${user.id}/institutes`;
      console.log(`API Request URL: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        throw new Error('Server returned non-JSON response');
      }

      const result: InstituteData[] = await response.json();
      console.log('Institutes API Response:', result);

      setInstitutes(result);
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${result.length} institutes.`
      });
    } catch (error) {
      console.error('Failed to load institutes:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load institutes data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load institutes on component mount if user is available
  useEffect(() => {
    if (user?.id && institutes.length === 0) {
      handleLoadInstitutes();
    }
  }, [user?.id]);

  const handleSelectInstitute = (instituteData: InstituteData) => {
    const institute = {
      id: instituteData.institute.id,
      name: instituteData.institute.name,
      code: instituteData.institute.code,
      description: `${instituteData.institute.address}, ${instituteData.institute.city}`,
      isActive: instituteData.institute.isActive
    };
    setSelectedInstitute(institute);
    
    toast({
      title: "Institute Selected",
      description: `Selected institute: ${institute.name}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Select Institute
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose an institute to continue to your dashboard
        </p>
      </div>

      {institutes.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No institutes found. Click the button below to refresh.
          </p>
          <Button 
            onClick={handleLoadInstitutes} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Institutes...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Institutes
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Institutes ({institutes.length})
            </h2>
            <Button 
              onClick={handleLoadInstitutes} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {institutes.map((instituteData) => (
              <Card 
                key={instituteData.institute.id} 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-blue-500"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Institute Image */}
                  <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={instituteData.institute.imageUrl}
                      alt={instituteData.institute.name}
                      className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  {/* Institute Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-6 w-6 text-blue-600" />
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {instituteData.institute.name}
                          </h3>
                          {instituteData.institute.isActive && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          Code: {instituteData.institute.code}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Role: {instituteData.userType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{instituteData.institute.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{instituteData.institute.phone}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <span>
                          {instituteData.institute.address}, {instituteData.institute.city}, {instituteData.institute.state}, {instituteData.institute.country} - {instituteData.institute.pinCode}
                        </span>
                      </div>
                    </div>

                    <Button 
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleSelectInstitute(instituteData)}
                    >
                      Select Institute
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InstituteSelector;
