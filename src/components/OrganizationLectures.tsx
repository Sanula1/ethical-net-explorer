
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Video, Search, Filter, Calendar, Clock, MapPin, Monitor, Eye, EyeOff, ExternalLink, FileText } from 'lucide-react';
import { organizationApi, OrganizationLecture, OrganizationQueryParams } from '@/api/organization.api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isValid, parseISO } from 'date-fns';

const formatSafeDate = (dateString: string, formatString: string): string => {
  try {
    if (!dateString) return 'Invalid date';
    
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    return format(date, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error, 'for date:', dateString);
    return 'Invalid date';
  }
};

const OrganizationLectures = () => {
  const [lectures, setLectures] = useState<OrganizationLecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [publicFilter, setPublicFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchLectures = async () => {
    try {
      setLoading(true);
      
      const params: OrganizationQueryParams = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(publicFilter !== 'all' && { isPublic: publicFilter === 'public' })
      };

      const response = await organizationApi.getLectures(params);
      setLectures(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast({
        title: "Error",
        description: "Failed to load lectures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [currentPage, searchTerm, modeFilter, publicFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLectures();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setModeFilter('all');
    setPublicFilter('all');
    setCurrentPage(1);
  };

  const filteredLectures = lectures.filter(lecture => {
    if (modeFilter === 'all') return true;
    return lecture.mode === modeFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lectures</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and manage organization lectures
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search lectures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <Select value={publicFilter} onValueChange={setPublicFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 flex items-end">
                <div className="flex gap-2 w-full">
                  <Button type="submit" className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lectures Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLectures.map((lecture) => (
          <Card key={lecture.lectureId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{lecture.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {lecture.description}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={lecture.isPublic ? "default" : "secondary"}>
                    {lecture.isPublic ? (
                      <><Eye className="h-3 w-3 mr-1" /> Public</>
                    ) : (
                      <><EyeOff className="h-3 w-3 mr-1" /> Private</>
                    )}
                  </Badge>
                  <Badge variant={lecture.mode === 'online' ? "default" : "outline"}>
                    {lecture.mode === 'online' ? (
                      <><Monitor className="h-3 w-3 mr-1" /> Online</>
                    ) : (
                      <><MapPin className="h-3 w-3 mr-1" /> Physical</>
                    )}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {formatSafeDate(lecture.timeStart, 'PPP')}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    {formatSafeDate(lecture.timeStart, 'p')} - {formatSafeDate(lecture.timeEnd, 'p')}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {lecture.venue}
                  </div>
                </div>
                
                {lecture.liveLink && (
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <a href={lecture.liveLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join {lecture.liveMode === 'meet' ? 'Google Meet' : 'Zoom'}
                    </a>
                  </Button>
                )}
                
                {lecture.documents && lecture.documents.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      Documents ({lecture.documentCount})
                    </div>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {lecture.documents.slice(0, 2).map((doc) => (
                        <div key={doc.documentationId} className="text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="font-medium">{doc.title}</div>
                          <div className="truncate">{doc.description}</div>
                        </div>
                      ))}
                      {lecture.documents.length > 2 && (
                        <div className="text-xs text-gray-500 italic">
                          +{lecture.documents.length - 2} more documents
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {filteredLectures.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Lectures Found</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {searchTerm || modeFilter !== 'all' || publicFilter !== 'all'
                ? 'No lectures match your current filters.'
                : 'No lectures available at the moment.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationLectures;
