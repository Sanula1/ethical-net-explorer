
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Server, Building2, School } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [baseUrl, setBaseUrl] = useState('');
  const [baseUrl2, setBaseUrl2] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing URLs from localStorage
    const savedBaseUrl = localStorage.getItem('baseUrl') || '';
    const savedBaseUrl2 = localStorage.getItem('baseUrl2') || '';
    setBaseUrl(savedBaseUrl);
    setBaseUrl2(savedBaseUrl2);
  }, []);

  const handleSaveUrls = () => {
    setIsSaving(true);
    
    try {
      // Save both URLs to localStorage
      localStorage.setItem('baseUrl', baseUrl);
      localStorage.setItem('baseUrl2', baseUrl2);
      
      toast({
        title: "Success",
        description: "Backend URLs saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save backend URLs",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearUrls = () => {
    setBaseUrl('');
    setBaseUrl2('');
    localStorage.removeItem('baseUrl');
    localStorage.removeItem('baseUrl2');
    
    toast({
      title: "Success",
      description: "Backend URLs cleared successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Backend Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure the backend URLs for different services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Institute Backend URL */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <School className="h-4 w-4 text-blue-600" />
              <Label htmlFor="baseUrl" className="text-sm font-medium">
                Institute Backend URL
              </Label>
            </div>
            <Input
              id="baseUrl"
              type="url"
              placeholder="https://your-institute-api.com"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This URL will be used for all institute-related API calls (students, teachers, classes, etc.)
            </p>
          </div>

          <Separator />

          {/* Organization Backend URL */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-green-600" />
              <Label htmlFor="baseUrl2" className="text-sm font-medium">
                Organization Backend URL
              </Label>
            </div>
            <Input
              id="baseUrl2"
              type="url"
              placeholder="https://your-organization-api.com"
              value={baseUrl2}
              onChange={(e) => setBaseUrl2(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This URL will be used for all organization-related API calls (organization management, etc.)
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleClearUrls}
              disabled={isSaving}
            >
              Clear URLs
            </Button>
            <Button
              onClick={handleSaveUrls}
              disabled={isSaving || (!baseUrl && !baseUrl2)}
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
