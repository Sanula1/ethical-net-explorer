
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataCardView } from '@/components/ui/data-card-view';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Users, Video, Play } from 'lucide-react';

interface LiveLecture {
  id: string;
  title: string;
  instructor: string;
  subject: string;
  grade: string;
  startTime: string;
  duration: string;
  attendees: number;
  maxAttendees: number;
  status: 'live' | 'starting-soon' | 'scheduled';
  meetingUrl: string;
}

// Mock live lectures data with proper typing
const mockLiveLectures: LiveLecture[] = [
  {
    id: '1',
    title: 'Advanced Mathematics - Calculus Integration',
    instructor: 'Dr. Sarah Johnson',
    subject: 'Mathematics',
    grade: 'Grade 12',
    startTime: '2024-01-22T10:00:00Z',
    duration: '60 min',
    attendees: 45,
    maxAttendees: 50,
    status: 'live',
    meetingUrl: 'https://meet.example.com/math-calc-123'
  },
  {
    id: '2',
    title: 'Physics - Quantum Mechanics Basics',
    instructor: 'Prof. Michael Chen',
    subject: 'Physics',
    grade: 'Grade 11',
    startTime: '2024-01-22T11:30:00Z',
    duration: '45 min',
    attendees: 32,
    maxAttendees: 40,
    status: 'starting-soon',
    meetingUrl: 'https://meet.example.com/physics-quantum-456'
  },
  {
    id: '3',
    title: 'English Literature - Shakespeare Analysis',
    instructor: 'Ms. Emily Watson',
    subject: 'English',
    grade: 'Grade 10',
    startTime: '2024-01-22T14:00:00Z',
    duration: '50 min',
    attendees: 28,
    maxAttendees: 35,
    status: 'scheduled',
    meetingUrl: 'https://meet.example.com/english-shakespeare-789'
  }
];

const LiveLectures = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'Student';

  const handleJoinLecture = (lecture: LiveLecture) => {
    // In a real app, this would handle joining the live lecture
    window.open(lecture.meetingUrl, '_blank');
  };

  const getStatusBadge = (status: LiveLecture['status']) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500 hover:bg-red-600">🔴 Live</Badge>;
      case 'starting-soon':
        return <Badge className="bg-orange-500 hover:bg-orange-600">⏰ Starting Soon</Badge>;
      case 'scheduled':
        return <Badge variant="outline">📅 Scheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Define columns for mobile card view
  const tableColumns = [
    {
      key: 'title',
      header: 'Title',
      render: (value: any, row: LiveLecture) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">by {row.instructor}</div>
        </div>
      )
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (value: any, row: LiveLecture) => (
        <div className="text-sm">
          <div>{value}</div>
          <div className="text-gray-500">{row.grade}</div>
        </div>
      )
    },
    {
      key: 'startTime',
      header: 'Time',
      render: (value: any, row: LiveLecture) => (
        <div className="text-sm">
          <div>{formatTime(value)}</div>
          <div className="text-gray-500">{row.duration}</div>
        </div>
      )
    },
    {
      key: 'attendees',
      header: 'Attendees',
      render: (value: any, row: LiveLecture) => `${value}/${row.maxAttendees}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: any) => getStatusBadge(value)
    }
  ];

  const customActions = [
    {
      label: 'Join',
      action: (lecture: LiveLecture) => handleJoinLecture(lecture),
      icon: <Play className="h-3 w-3" />,
      variant: 'default' as const
    }
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Live Lectures
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Join live lectures and interactive sessions
        </p>
      </div>

      {/* Mobile View Content - Always show card view */}
      <div className="md:hidden">
        <DataCardView
          data={mockLiveLectures}
          columns={tableColumns}
          customActions={customActions}
          allowEdit={false}
          allowDelete={false}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        {userRole === 'Student' ? (
          // Student view - Horizontal cards
          <div className="space-y-4">
            {mockLiveLectures.map((lecture) => (
              <Card key={lecture.id} className="w-full">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {lecture.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {lecture.instructor}
                          </p>
                        </div>
                        {getStatusBadge(lecture.status)}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(lecture.startTime)} • {lecture.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{lecture.attendees}/{lecture.maxAttendees} attendees</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="h-4 w-4" />
                          <span>{lecture.subject} • {lecture.grade}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      {lecture.status === 'live' && (
                        <Button 
                          onClick={() => handleJoinLecture(lecture)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Join Now
                        </Button>
                      )}
                      {lecture.status === 'starting-soon' && (
                        <Button 
                          onClick={() => handleJoinLecture(lecture)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Join Soon
                        </Button>
                      )}
                      {lecture.status === 'scheduled' && (
                        <Button 
                          variant="outline"
                          onClick={() => handleJoinLecture(lecture)}
                        >
                          Set Reminder
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Admin/Teacher view - Grid layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLiveLectures.map((lecture) => (
              <Card key={lecture.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{lecture.title}</CardTitle>
                    {getStatusBadge(lecture.status)}
                  </div>
                  <CardDescription>
                    by {lecture.instructor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{formatTime(lecture.startTime)} • {lecture.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{lecture.attendees}/{lecture.maxAttendees} attendees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-gray-500" />
                      <span>{lecture.subject} • {lecture.grade}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleJoinLecture(lecture)}
                    >
                      Manage
                    </Button>
                    {lecture.status === 'live' && (
                      <Button 
                        size="sm"
                        onClick={() => handleJoinLecture(lecture)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Join
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {mockLiveLectures.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Live Lectures
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are currently no live lectures scheduled.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveLectures;
