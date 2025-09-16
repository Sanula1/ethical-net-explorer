import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Calendar, Clock, MapPin, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { examApi, type ExamCreateData } from '@/api/exam.api';
import { instituteApi, type Class, type Subject } from '@/api/institute.api';

interface CreateExamFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
  isEdit?: boolean;
}

const CreateExamForm = ({ onClose, onSuccess, initialData, isEdit = false }: CreateExamFormProps) => {
  const { selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    examType: 'online' as 'online' | 'physical',
    duration: 60,
    maxMarks: 100,
    passingMarks: 40,
    examDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    examLink: '',
    instructions: '',
    status: 'scheduled' as 'scheduled' | 'draft' | 'completed' | 'cancelled',
    toWhom: 'everyone',
    isActive: true,
    classId: currentClassId || '',
    subjectId: currentSubjectId || ''
  });

  useEffect(() => {
    if (selectedInstitute) {
      fetchClasses();
    }
  }, [selectedInstitute]);

  useEffect(() => {
    if (formData.classId) {
      fetchSubjects();
    }
  }, [formData.classId]);

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        examType: initialData.examType || 'online',
        duration: initialData.durationMinutes || 60,
        maxMarks: parseFloat(initialData.totalMarks) || 100,
        passingMarks: parseFloat(initialData.passingMarks) || 40,
        examDate: initialData.scheduleDate ? initialData.scheduleDate.split('T')[0] : '',
        startTime: initialData.startTime ? new Date(initialData.startTime).toTimeString().split(' ')[0] : '',
        endTime: initialData.endTime ? new Date(initialData.endTime).toTimeString().split(' ')[0] : '',
        venue: initialData.venue || '',
        examLink: initialData.examLink || '',
        instructions: initialData.instructions || '',
        status: initialData.status || 'scheduled',
        toWhom: initialData.toWhom || 'everyone',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        classId: initialData.classId || currentClassId || '',
        subjectId: initialData.subjectId || currentSubjectId || ''
      });
    }
  }, [initialData, isEdit, currentClassId, currentSubjectId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitute || !user?.id) return;

    setLoading(true);
    try {
      const payload: ExamCreateData = {
        instituteId: selectedInstitute.id,
        classId: formData.classId,
        subjectId: formData.subjectId,
        title: formData.title,
        description: formData.description,
        examType: formData.examType,
        duration: formData.duration,
        maxMarks: formData.maxMarks,
        passingMarks: formData.passingMarks,
        examDate: formData.examDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue || null,
        examLink: formData.examLink || null,
        instructions: formData.instructions || null,
        status: formData.status,
        createdBy: user.id.toString(),
        toWhom: formData.toWhom,
        isActive: formData.isActive
      };

      if (isEdit) {
        await examApi.updateExam(initialData.id, payload);
      } else {
        await examApi.createExam(payload);
      }

      toast({
        title: "Success",
        description: `Exam ${isEdit ? 'updated' : 'created'} successfully`
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} exam:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} exam`,
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEdit ? 'Update Exam' : 'Create New Exam'}</CardTitle>
              <CardDescription>
                {isEdit ? 'Update exam details' : 'Create a new exam for students'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!user?.id && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Warning: No user ID found. Please ensure you are logged in.
                </p>
              </div>
            )}
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Exam Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter exam title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="examType">Exam Type *</Label>
                <Select value={formData.examType} onValueChange={(value) => handleInputChange('examType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
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
                placeholder="Enter exam description"
                required
              />
            </div>

            {/* Class and Subject Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="classId">Class *</Label>
                <Select 
                  value={formData.classId || undefined} 
                  onValueChange={(value) => handleInputChange('classId', value)}
                  disabled={!!currentClassId}
                >
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
                <Select 
                  value={formData.subjectId || undefined} 
                  onValueChange={(value) => handleInputChange('subjectId', value)}
                  disabled={!formData.classId || !!currentSubjectId}
                >
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

            {/* Exam Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxMarks">Maximum Marks *</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => handleInputChange('maxMarks', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="passingMarks">Passing Marks *</Label>
                <Input
                  id="passingMarks"
                  type="number"
                  value={formData.passingMarks}
                  onChange={(e) => handleInputChange('passingMarks', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="examDate">Exam Date *</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => handleInputChange('examDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
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
                  placeholder={formData.examType === 'online' ? 'Online Platform' : 'Physical Location'}
                />
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.examType === 'online' && (
              <div>
                <Label htmlFor="examLink">Exam Link</Label>
                <Input
                  id="examLink"
                  value={formData.examLink}
                  onChange={(e) => handleInputChange('examLink', e.target.value)}
                  placeholder="https://exam.example.com/..."
                />
              </div>
            )}

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Enter exam instructions for students"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !user?.id}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Exam' : 'Create Exam')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateExamForm;
