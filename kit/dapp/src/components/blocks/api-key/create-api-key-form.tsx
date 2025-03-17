'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { CopyToClipboard } from '@/components/blocks/copy/copy';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authClient } from '@/lib/auth/client';
import { useState } from 'react';
import { toast } from 'sonner';

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  expiresIn: z.string(),
});

type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;

interface CreateApiKeyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EXPIRY_OPTIONS = [
  { value: 'none', label: 'No expiry' },
  { value: '86400', label: '1 day' },
  { value: '604800', label: '1 week' },
  { value: '2592000', label: '1 month' },
  { value: '31536000', label: '1 year' },
] as const;

export function CreateApiKeyForm({
  open,
  onOpenChange,
  onSuccess,
}: CreateApiKeyFormProps) {
  const t = useTranslations('portfolio.settings.api-keys');
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);

  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: '',
      expiresIn: '',
    },
  });

  const onSubmit = async (data: CreateApiKeyFormValues) => {
    try {
      const response = await authClient.apiKey.create({
        name: data.name,
        expiresIn:
          data.expiresIn === 'none'
            ? undefined
            : Number.parseInt(data.expiresIn),
      });

      if (response.data) {
        setCreatedApiKey(response.data.key);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error(t('create-error'));
    }
  };

  const handleClose = () => {
    form.reset();
    setCreatedApiKey(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('create-api-key')}</DialogTitle>
          <DialogDescription>
            {createdApiKey
              ? t('api-key-created-description')
              : t('create-api-key-description')}
          </DialogDescription>
        </DialogHeader>

        {createdApiKey ? (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-center justify-between gap-2">
                <code className="flex-1 break-all text-sm">
                  {createdApiKey}
                </code>
                <CopyToClipboard
                  value={createdApiKey}
                  successMessage={t('api-key-copied')}
                />
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('api-key-save-warning')}
            </p>
            <DialogFooter>
              <Button onClick={handleClose}>{t('close')}</Button>
            </DialogFooter>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name-label')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('expiry-label')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('select-expiry-placeholder')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPIRY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {t(`expiry-options.${option.label}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? t('creating-api-key')
                    : t('create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
