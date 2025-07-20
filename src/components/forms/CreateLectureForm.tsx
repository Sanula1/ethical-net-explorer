import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { X, Save, Video, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lectureApi, type LectureCreateData } from '@/api/lecture.api';
import { instituteApi, type Class, type Subject, type Teacher } from '@/api/institute.api';

interface CreateLectureFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateLectureForm = ({ onClose, onSuccess }: CreateLectureFormProps) => {
  const { selectedInstitute } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isInstituteLecture, setIsInstituteLecture] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lectureType: 'online' as 'online' | 'physical',
    venue: '',
    subject: '',
    classId: '',
    subjectId: '',
    instructorId: '',
    startTime: '',
    endTime: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'in_progress',
    meetingLink: '',
    meetingId: '',
    meetingPassword: '',
    recordingUrl: '',
    isRecorded: false,
    maxParticipants: 50,
    isActive: true
  });

  useEffect(() => {
    if (selectedInstitute) {
      fetchClasses();
      fetchTeachers();
    }
  }, [selectedInstitute]);

  useEffect(() => {
    if (formData.classId && !isInstituteLecture) {
      fetchSubjects();
    }
  }, [formData.classId, isInstituteLecture]);

  // Reset form fields when institute lecture toggle changes
  useEffect(() => {
    if (isInstituteLecture) {
      setFormData(prev => ({
        ...prev,
        classId: '',
        subjectId: ''
      }));
    }
  }, [isInstituteLecture]);

  const fetchClasses = async () => {
    try {
      const response = await instituteApi.getInstituteClasses(selectedInstitute!.id, { isActive: true });
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await instituteApi.getInstituteClassSubjects(selectedInstitute!.id, formData.classId);
      setSubjects(data.map((item: any) => item.subject) || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await instituteApi.getInstituteUsers(selectedInstitute!.id, 'TEACHER');
      setTeachers(response.data?.map((item: any) => item.user) || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitute) return;

    setLoading(true);
    try {
      const payload: LectureCreateData = {
        instituteId: selectedInstitute.id,
        classId: isInstituteLecture ? undefined : formData.classId,
        subjectId: isInstituteLecture ? undefined : formData.subjectId,
        instructorId: formData.instructorId,
        title: formData.title,
        description: formData.description,
        lectureType: formData.lectureType,
        venue: formData.venue || null,
        subject: isInstituteLecture ? formData.subject || undefined : undefined,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        status: formData.status,
        meetingLink: formData.meetingLink || null,
        meetingId: formData.meetingId || null,
        meetingPassword: formData.meetingPassword || null,
        recordingUrl: formData.recordingUrl || null,
        isRecorded: formData.isRecorded,
        maxParticipants: formData.maxParticipants,
        isActive: formData.isActive
      };

      await lectureApi.createLecture(payload, isInstituteLecture);

      toast({
        title: "Success",
        description: `${isInstituteLecture ? 'Institute lecture' : 'Lecture'} created successfully`
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create lecture",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Lecture</CardTitle>
              <CardDescription>Create a new lecture session for students</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Institute Lecture Toggle */}
            <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
              <Switch 
                id="institute-lecture"
                checked={isInstituteLecture}
                onCheckedChange={setIsInstituteLecture}
              />
              <Label htmlFor="institute-lecture" className="font-medium">
                Enable Institute Lecture
              </Label>
              <span className="text-sm text-gray-500">
                (Institute-wide lecture without specific class/subject)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="lectureType">Lecture Type *</Label>
                <Select value={formData.lectureType} onValueChange={(value) => handleInputChange('lectureType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lecture type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Online
                      </div>
                    </SelectItem>
                    <SelectItem value="physical">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Physical
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter lecture description"
                required
              />
            </div>

            {/* Conditional fields based on institute lecture toggle */}
            {isInstituteLecture ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="classId">Class (Optional)</Label>
                  <Select 
                    value={formData.classId || undefined} 
                    onValueChange={(value) => handleInputChange('classId', value || '')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific class</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Enter subject (optional)"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="classId">Class *</Label>
                  <Select value={formData.classId || undefined} onValueChange={(value) => handleInputChange('classId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subjectId">Subject *</Label>
                  <Select value={formData.subjectId || undefined} onValueChange={(value) => handleInputChange('subjectId', value)} disabled={!formData.classId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="instructorId">Instructor *</Label>
              <Select value={formData.instructorId || undefined} onValueChange={(value) => handleInputChange('instructorId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  placeholder={formData.lectureType === 'online' ? 'Online Platform' : 'Physical Location'}
                />
              </div>
              <div>
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>

            {formData.lectureType === 'online' && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-medium">Online Meeting Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meetingLink">Meeting Link</Label>
                    <Input
                      id="meetingLink"
                      value={formData.meetingLink}
                      onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="meetingId">Meeting ID</Label>
                    <Input
                      id="meetingId"
                      value={formData.meetingId}
                      onChange={(e) => handleInputChange('meetingId', e.target.value)}
                      placeholder="Meeting ID"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="meetingPassword">Meeting Password</Label>
                  <Input
                    id="meetingPassword"
                    value={formData.meetingPassword}
                    onChange={(e) => handleInputChange('meetingPassword', e.target.value)}
                    placeholder="Optional meeting password"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Lecture'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLectureForm;
