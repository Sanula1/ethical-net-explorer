
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Video, Search, Filter, Calendar, MapPin, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizationSpecificApi, type OrganizationLecture, type LectureCreateData, type Cause, type CauseResponse } from '@/api/organization.api';

const OrganizationLectures = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lectures, setLectures] = useState<OrganizationLecture[]>([]);
  const [causes, setCauses] = useState<Cause[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublic, setFilterPublic] = useState<boolean | null>(null);
  const [filterMode, setFilterMode] = useState<string>('all');

  // Create lecture form state
  const [createForm, setCreateForm] = useState<LectureCreateData>({
    causeId: '',
    title: '',
    content: '',
    isPublic: true,
    description: '',
    venue: '',
    mode: 'online',
    liveLink: '',
    liveMode: '',
    recordingUrl: ''
  });

  // Check if user is OrganizationManager
  const isOrganizationManager = user?.role === 'OrganizationManager';

  useEffect(() => {
    if (isOrganizationManager) {
      loadLectures();
      loadCauses();
    }
  }, [isOrganizationManager]);

  const loadLectures = async () => {
    try {
      setIsLoading(true);
      const response = await organizationSpecificApi.get<OrganizationLecture[]>('/organization/api/v1/lectures');
      setLectures(response || []);
    } catch (error) {
      console.error('Error loading lectures:', error);
      toast({
        title: "Error",
        description: "Failed to load lectures",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCauses = async () => {
    try {
      const response = await organizationSpecificApi.get<CauseResponse>('/organization/api/v1/causes');
      setCauses(response.data || []);
    } catch (error) {
      console.error('Error loading causes:', error);
    }
  };

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.causeId || !createForm.title.trim() || !createForm.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Cause, title, and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await organizationSpecificApi.post<OrganizationLecture>('/organization/api/v1/lectures', createForm);
      
      setLectures(prev => [response, ...prev]);
      setIsCreateDialogOpen(false);
      setCreateForm({
        causeId: '',
        title: '',
        content: '',
        isPublic: true,
        description: '',
        venue: '',
        mode: 'online',
        liveLink: '',
        liveMode: '',
        recordingUrl: ''
      });
      
      toast({
        title: "Success",
        description: "Lecture created successfully",
      });
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast({
        title: "Error",
        description: "Failed to create lecture",
        variant: "destructive",
      });
    }
  };

  // Filter lectures based on search and filters
  const filteredLectures = lectures.filter(lecture => {
    const matchesSearch = !searchTerm || 
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.cause.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPublic = filterPublic === null || lecture.isPublic === filterPublic;
    const matchesMode = filterMode === 'all' || lecture.mode === filterMode;
    
    return matchesSearch && matchesPublic && matchesMode;
  });

  if (!isOrganizationManager) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only Organization Managers can access this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Lectures
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your organization's lectures and educational content
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Lecture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lecture</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div>
                <Label htmlFor="causeId">Cause</Label>
                <Select value={createForm.causeId} onValueChange={(value) => setCreateForm(prev => ({ ...prev, causeId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cause" />
                  </SelectTrigger>
                  <SelectContent>
                    {causes.map((cause) => (
                      <SelectItem key={cause.causeId} value={cause.causeId}>
                        {cause.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter lecture title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={createForm.content}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter lecture content"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter lecture description"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Select value={createForm.mode || 'online'} onValueChange={(value) => setCreateForm(prev => ({ ...prev, mode: value as 'online' | 'physical' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={createForm.venue}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="Enter venue"
                />
              </div>
              
              <div>
                <Label htmlFor="liveLink">Live Link</Label>
                <Input
                  id="liveLink"
                  value={createForm.liveLink}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, liveLink: e.target.value }))}
                  placeholder="Enter live link"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={createForm.isPublic}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="isPublic">Public Lecture</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Create Lecture
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search lectures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Button
            variant={filterPublic === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPublic(null)}
          >
            All
          </Button>
          <Button
            variant={filterPublic === true ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPublic(true)}
          >
            Public
          </Button>
          <Button
            variant={filterPublic === false ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterPublic(false)}
          >
            Private
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={filterMode === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterMode('all')}
          >
            All Modes
          </Button>
          <Button
            variant={filterMode === 'online' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterMode('online')}
          >
            Online
          </Button>
          <Button
            variant={filterMode === 'physical' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterMode('physical')}
          >
            Physical
          </Button>
        </div>
      </div>

      {/* Lectures Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading lectures...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => (
            <Card key={lecture.lectureId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{lecture.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{lecture.content}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={lecture.isPublic ? "default" : "secondary"}>
                    {lecture.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="outline" className="mr-2">
                      {lecture.cause.title}
                    </Badge>
                    <span>{lecture.cause.organization.name}</span>
                  </div>
                  
                  {lecture.mode && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {lecture.mode === 'online' ? (
                        <Globe className="h-4 w-4 mr-1" />
                      ) : (
                        <MapPin className="h-4 w-4 mr-1" />
                      )}
                      <span className="capitalize">{lecture.mode}</span>
                      {lecture.venue && <span className="ml-1">• {lecture.venue}</span>}
                    </div>
                  )}
                  
                  {lecture.liveLink && (
                    <div className="mt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Video className="h-4 w-4 mr-2" />
                        Join Live
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredLectures.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No lectures found</p>
              <p className="text-sm mt-2">
                {searchTerm || filterPublic !== null || filterMode !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Click "Create Lecture" to add your first lecture'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationLectures;
