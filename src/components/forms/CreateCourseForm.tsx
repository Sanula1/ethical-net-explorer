
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { organizationApi, CourseCreateData } from '@/api/organization.api';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
});

type CreateCourseFormData = z.infer<typeof createCourseSchema>;

interface CreateCourseFormProps {
  onSuccess: (course: any) => void;
  onCancel: () => void;
}

const CreateCourseForm = ({ onSuccess, onCancel }: CreateCourseFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization } = useAuth();

  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateCourseFormData) => {
    if (!selectedOrganization?.id) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const courseData: CourseCreateData = {
        title: data.title,
        description: data.description,
        organizationId: selectedOrganization.id,
      };

      const newCourse = await organizationApi.createCourse(courseData);
      
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      
      onSuccess(newCourse);
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new course to your organization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Information
          </CardTitle>
          <CardDescription>
            Enter the details for the new course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter course title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter course description"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourseForm;
