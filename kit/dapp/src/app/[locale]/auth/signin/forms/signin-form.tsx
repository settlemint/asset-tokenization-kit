'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/routing';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm({
  className,
  redirectUrl = '/',
  ...props
}: ComponentPropsWithoutRef<'form'> & { redirectUrl?: string }) {
  const decodedRedirectUrl = decodeURIComponent(redirectUrl);
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    await authClient.signIn.email(data, {
      onSuccess: async () => {
        const session = await authClient.getSession();
        const userRole = session.data?.user.role;
        const isAdminOrIssuer = userRole === 'issuer' || userRole === 'admin';
        const adminRedirect = decodedRedirectUrl.trim() || '/admin';
        const targetUrl = isAdminOrIssuer ? adminRedirect : '/portfolio';
        window.location.replace(targetUrl);
      },
      onError: (ctx) => {
        form.setError('root', {
          message: ctx.error.message,
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(onSubmit)(e);
        }}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-2xl">Login to your account</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Enter your email below to login to your account
          </p>
        </div>
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    autoComplete="email"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="pb-2 font-normal text-sm">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href={`/auth/signup?rd=${decodedRedirectUrl}`}
            className="underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}
