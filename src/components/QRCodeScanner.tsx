
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, QrCode, UserCheck, CheckCircle, MapPin, Monitor } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface MarkAttendanceRequest {
  action: "markSingle";
  data: {
    user_id: string;
    device_type: string;
    location: string;
    marker_id: string;
    status: "present" | "absent" | "late";
    institute_id: string;
  };
}

interface MarkAttendanceResponse {
  success: boolean;
  data: {
    user_id: string;
    timestamp: string;
    device_type: string;
    location: string;
    marker_id: string;
    status: string;
    institute_id: string;
  };
  timestamp: string;
}

const QRCodeScanner = () => {
  const { selectedInstitute, currentInstituteId, user } = useAuth();
  const { toast } = useToast();
  
  const [studentId, setStudentId] = useState('');
  const [markedCount, setMarkedCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [location, setLocation] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Check if user has permission
  const hasPermission = user?.role === 'InstituteAdmin' || user?.role === 'AttendanceMarker';

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`https://maps.google.com/?q=${latitude},${longitude}`);
        },
        (error) => {
          console.log('Location access denied:', error);
          setLocation('Location not available');
        }
      );
    }

    return () => {
      // Cleanup QR scanner on unmount
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  };

  const getAttendanceBaseUrl = () => {
    return 'https://azs5u6og5yxz2vwseaqn7uq3ua0ufpla.lambda-url.us-east-1.on.aws';
  };

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const startCamera = async () => {
    try {
      if (!videoRef.current) return;

      // Initialize QR Scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          setStudentId(result.data);
          
          // Auto-trigger attendance marking when QR code is detected
          setTimeout(() => {
            handleMarkAttendance(result.data);
          }, 500);
        },
        {
          returnDetailedScanResult: true,
          preferredCamera: 'environment', // Use back camera on mobile
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
      setIsScanning(true);

      toast({
        title: "Camera Started",
        description: "Point camera at QR code to scan automatically"
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const handleMarkAttendance = async (userId: string) => {
    if (!userId.trim() || !currentInstituteId || !user?.id) {
      toast({
        title: "Missing Information",
        description: "Please ensure student ID and institute are selected",
        variant: "destructive"
      });
      return;
    }

    try {
      const baseUrl = getAttendanceBaseUrl();
      const headers = getApiHeaders();
      
      const requestBody: MarkAttendanceRequest = {
        action: "markSingle",
        data: {
          user_id: userId.trim(),
          device_type: getDeviceType(),
          location: location || "Location not available",
          marker_id: user.id,
          status: "present",
          institute_id: currentInstituteId
        }
      };

      console.log('Marking attendance via AWS Lambda:', requestBody);
      console.log('Using AWS Lambda URL:', baseUrl);

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to mark attendance: ${response.status}`);
      }

      const result: MarkAttendanceResponse = await response.json();
      console.log('Attendance marked successfully via AWS Lambda:', result);

      if (result.success) {
        setMarkedCount(prev => prev + 1);
        setStudentId('');
        
        toast({
          title: "Attendance Marked",
          description: `Successfully marked attendance for student ${userId}`,
        });

        // Focus back to input for continuous scanning
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } else {
        throw new Error('Failed to mark attendance');
      }
    } catch (error) {
      console.error('Failed to mark attendance via AWS Lambda:', error);
      toast({
        title: "Mark Failed",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStudentIdChange = (value: string) => {
    setStudentId(value);
  };

  const handleManualSubmit = () => {
    if (studentId.trim()) {
      handleMarkAttendance(studentId);
    }
  };

  const handleBack = () => {
    stopCamera();
    window.history.back();
  };

  // Simulate QR code scan for demo purposes
  const simulateQRScan = () => {
    const randomId = `STU${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setStudentId(randomId);
    handleMarkAttendance(randomId);
  };

  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to mark attendance. This feature is only available for Institute Admins and Attendance Markers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedInstitute) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Institute Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please select an institute first to mark attendance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            QR Code Attendance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan QR codes to mark student attendance
          </p>
        </div>
      </div>

      {/* Current Institute Info */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <QrCode className="h-5 w-5" />
            Current Institute
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">{selectedInstitute.name}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Marker: {user?.name} | Device: {getDeviceType()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Point camera at QR code to automatically scan and mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Camera View */}
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover rounded-lg ${isScanning ? 'block' : 'hidden'}`}
                autoPlay
                playsInline
                muted
              />
              {!isScanning && (
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Camera Off</p>
                  <p className="text-sm text-gray-500">Click start to begin scanning</p>
                </div>
              )}
            </div>

            {/* Scanner Controls */}
            <div className="flex gap-2">
              {!isScanning ? (
                <Button onClick={startCamera} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  Stop Camera
                </Button>
              )}
              <Button onClick={simulateQRScan} variant="outline">
                Demo Scan
              </Button>
            </div>

            {/* Location Info */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Location: {location || 'Getting location...'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <Monitor className="h-4 w-4" />
                <span>Device: {getDeviceType()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Manual Entry
            </CardTitle>
            <CardDescription>
              Manually enter student ID to mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student ID Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Student ID
              </label>
              <Input
                ref={inputRef}
                value={studentId}
                onChange={(e) => handleStudentIdChange(e.target.value)}
                placeholder="Enter student ID or scan QR code"
                className="text-lg"
                autoFocus
              />
            </div>

            {/* Mark Button */}
            <Button 
              onClick={handleManualSubmit} 
              disabled={!studentId.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>

            {/* Statistics */}
            <div className="space-y-3">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{markedCount}</p>
                <p className="text-sm text-green-600 dark:text-green-400">Students Marked Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Message */}
      {markedCount > 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">
                {markedCount} student{markedCount > 1 ? 's' : ''} attendance has been marked successfully
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeScanner;
