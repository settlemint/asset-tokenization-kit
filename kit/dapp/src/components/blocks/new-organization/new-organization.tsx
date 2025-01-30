import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/client';
import { slugify } from '@/lib/slugify';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface NewOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
});

interface NewOrganizationFormData {
  name: string;
}

export function NewOrganizationDialog({ open, onOpenChange }: NewOrganizationDialogProps) {
  const form = useForm<NewOrganizationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: NewOrganizationFormData) => {
    try {
      setIsLoading(true);
      await authClient.organization.create({
        name: data.name,
        slug: slugify(data.name),
      });
      toast.success('Organization created successfully');
      setIsLoading(false);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(`Failed to create organization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Organization</DialogTitle>
              <DialogDescription>Create a new organization to manage your users and assets.</DialogDescription>
            </DialogHeader>
            <div className="mt-6 mb-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Organization Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenChange(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button variant="default" type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
