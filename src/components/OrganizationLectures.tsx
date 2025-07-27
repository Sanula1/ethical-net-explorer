
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, Video, MapPin, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { organizationApi, type OrganizationLecture, type LectureCreateData } from '@/api/organization.api';

const OrganizationLectures = () => {
  const [lectures, setLectures] = useState<OrganizationLecture[]>([]);
  const [filteredLectures, setFilteredLectures] = useState<OrganizationLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    isPublic: undefined as boolean | undefined,
    mode: '',
    causeId: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadLectures();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [lectures, searchTerm, filters]);

  const loadLectures = async () => {
    try {
      setLoading(true);
      const response = await organizationApi.getLectures();
      setLectures(response);
    } catch (error) {
      console.error('Error loading lectures:', error);
      toast({
        title: "Error",
        description: "Failed to load lectures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = lectures;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lecture =>
        lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.cause?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Public/Private filter
    if (filters.isPublic !== undefined) {
      filtered = filtered.filter(lecture => lecture.isPublic === filters.isPublic);
    }

    // Mode filter
    if (filters.mode) {
      filtered = filtered.filter(lecture => lecture.mode === filters.mode);
    }

    // Cause ID filter
    if (filters.causeId) {
      filtered = filtered.filter(lecture => lecture.causeId === filters.causeId);
    }

    setFilteredLectures(filtered);
  };

  const handleCreateLecture = async (data: LectureCreateData) => {
    try {
      const newLecture = await organizationApi.createLecture(data);
      setLectures(prev => [newLecture, ...prev]);
      setShowCreateDialog(false);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      isPublic: undefined,
      mode: '',
      causeId: ''
    });
    setSearchTerm('');
  };

  const formatDate = (dateObj: any) => {
    if (!dateObj) return 'Not set';
    try {
      return new Date(dateObj).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organization Lectures</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Lecture
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Lecture</DialogTitle>
              <DialogDescription>
                Create a new lecture for your organization
              </DialogDescription>
            </DialogHeader>
            <CreateLectureForm onSubmit={handleCreateLecture} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search lectures..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle>Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-filter"
                  checked={filters.isPublic === true}
                  onCheckedChange={(checked) => 
                    handleFilterChange('isPublic', checked ? true : undefined)
                  }
                />
                <Label htmlFor="public-filter">Public lectures only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="private-filter"
                  checked={filters.isPublic === false}
                  onCheckedChange={(checked) => 
                    handleFilterChange('isPublic', checked ? false : undefined)
                  }
                />
                <Label htmlFor="private-filter">Private lectures only</Label>
              </div>
              <div>
                <Label htmlFor="mode-filter">Mode</Label>
                <Input
                  id="mode-filter"
                  placeholder="Filter by mode (online/physical)"
                  value={filters.mode}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cause-filter">Cause ID</Label>
                <Input
                  id="cause-filter"
                  placeholder="Filter by cause ID"
                  value={filters.causeId}
                  onChange={(e) => handleFilterChange('causeId', e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lectures List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading lectures...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLectures.map((lecture) => (
            <Card key={lecture.lectureId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {lecture.mode === 'online' ? (
                        <Video className="h-6 w-6 text-primary" />
                      ) : (
                        <MapPin className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{lecture.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {lecture.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={lecture.isPublic ? "default" : "secondary"}>
                    {lecture.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Cause: {lecture.cause?.title}</p>
                  <p>Organization: {lecture.cause?.organization?.name}</p>
                </div>
                
                {lecture.mode && (
                  <div className="flex items-center space-x-2 text-sm">
                    {lecture.mode === 'online' ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    <span className="capitalize">{lecture.mode}</span>
                    {lecture.venue && <span>• {lecture.venue}</span>}
                  </div>
                )}

                {(lecture.timeStart || lecture.timeEnd) && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(lecture.timeStart)} - {formatDate(lecture.timeEnd)}
                    </span>
                  </div>
                )}

                {lecture.liveLink && (
                  <div className="text-sm">
                    <a
                      href={lecture.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Join Live Session
                    </a>
                  </div>
                )}

                {lecture.recordingUrl && (
                  <div className="text-sm">
                    <a
                      href={lecture.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Recording
                    </a>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <p>Lecture ID: {lecture.lectureId}</p>
                  <p>Cause ID: {lecture.causeId}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredLectures.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No lectures found</p>
              <p className="text-sm mt-2">Create your first lecture to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const CreateLectureForm = ({ onSubmit }: { onSubmit: (data: LectureCreateData) => void }) => {
  const [formData, setFormData] = useState<LectureCreateData>({
    causeId: '',
    title: '',
    content: '',
    isPublic: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof LectureCreateData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="causeId">Cause ID *</Label>
        <Input
          id="causeId"
          value={formData.causeId}
          onChange={(e) => handleInputChange('causeId', e.target.value)}
          placeholder="Enter cause ID"
          required
        />
      </div>
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter lecture title"
          required
        />
      </div>
      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          placeholder="Enter lecture content"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          checked={formData.isPublic}
          onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
        />
        <Label htmlFor="isPublic">Public lecture</Label>
      </div>
      <Button type="submit" className="w-full">
        Create Lecture
      </Button>
    </form>
  );
};

export default OrganizationLectures;
