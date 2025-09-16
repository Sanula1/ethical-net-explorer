import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { homeworkApi, type HomeworkCreateData } from '@/api/homework.api';
import { instituteApi, type Class, type Subject, type Teacher } from '@/api/institute.api';

interface CreateHomeworkFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateHomeworkForm = ({ onClose, onSuccess }: CreateHomeworkFormProps) => {
  const { selectedInstitute } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    classId: '',
    subjectId: '',
    teacherId: '',
    startDate: '',
    dueDate: '',
    maxMarks: '',
    attachmentUrl: '',
    isActive: true
  });

  useEffect(() => {
    if (selectedInstitute) {
      fetchClasses();
      fetchTeachers();
    }
  }, [selectedInstitute]);

  useEffect(() => {
    if (formData.classId) {
      fetchSubjects();
    }
  }, [formData.classId]);

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
      const payload: HomeworkCreateData = {
        instituteId: selectedInstitute.id,
        classId: formData.classId,
        subjectId: formData.subjectId,
        teacherId: formData.teacherId,
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        maxMarks: formData.maxMarks ? parseInt(formData.maxMarks) : null,
        attachmentUrl: formData.attachmentUrl || null,
        isActive: formData.isActive
      };

      await homeworkApi.createHomework(payload);

      toast({
        title: "Success",
        description: "Homework created successfully"
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create homework",
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
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create New Homework</CardTitle>
              <CardDescription>Create a new homework assignment for students</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter homework title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="maxMarks">Max Marks</Label>
                <Input
                  id="maxMarks"
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => handleInputChange('maxMarks', e.target.value)}
                  placeholder="Enter maximum marks"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter homework description"
                required
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Enter detailed instructions for students"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="classId">Class *</Label>
                <Select value={formData.classId} onValueChange={(value) => handleInputChange('classId', value)}>
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
                <Select value={formData.subjectId} onValueChange={(value) => handleInputChange('subjectId', value)} disabled={!formData.classId}>
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

              <div>
                <Label htmlFor="teacherId">Teacher *</Label>
                <Select value={formData.teacherId} onValueChange={(value) => handleInputChange('teacherId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="attachmentUrl">Attachment URL</Label>
              <Input
                id="attachmentUrl"
                value={formData.attachmentUrl}
                onChange={(e) => handleInputChange('attachmentUrl', e.target.value)}
                placeholder="Enter attachment URL (optional)"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Homework'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateHomeworkForm;
