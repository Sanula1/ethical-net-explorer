
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { organizationApi, OrganizationCreateData } from '@/api/organization.api';
import { useToast } from '@/hooks/use-toast';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  type: z.enum(['INSTITUTE', 'GLOBAL']),
  isPublic: z.boolean(),
  enrollmentKey: z.string().optional(),
  instituteId: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface CreateOrganizationFormProps {
  onSuccess?: (organization: any) => void;
  onCancel?: () => void;
}

const CreateOrganizationForm = ({ onSuccess, onCancel }: CreateOrganizationFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      type: 'INSTITUTE',
      isPublic: true,
      enrollmentKey: '',
      instituteId: '',
    },
  });

  const onSubmit = async (data: OrganizationFormData) => {
    setIsLoading(true);
    try {
      const organizationData: OrganizationCreateData = {
        name: data.name,
        type: data.type,
        isPublic: data.isPublic,
        enrollmentKey: data.enrollmentKey || undefined,
        instituteId: data.instituteId || undefined,
      };

      const result = await organizationApi.createOrganization(organizationData);
      
      toast({
        title: 'Success',
        description: 'Organization created successfully',
      });

      if (onSuccess) {
        onSuccess(result);
      }

      form.reset();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to create organization',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Organization</CardTitle>
        <CardDescription>
          Fill in the details to create a new organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter organization name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INSTITUTE">Institute</SelectItem>
                      <SelectItem value="GLOBAL">Global</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instituteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institute ID (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter institute ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enrollmentKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enrollment Key (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter enrollment key"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Organization</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Make this organization visible to all users
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Creating...' : 'Create Organization'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateOrganizationForm;
