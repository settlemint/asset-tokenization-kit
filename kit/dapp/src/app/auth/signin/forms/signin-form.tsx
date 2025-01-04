'use client';

import { TextInput } from '@/components/blocks/form/controls/text-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentPropsWithoutRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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

  const router = useRouter();
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = form;

  const onSubmit = async (data: SignInFormData) => {
    await authClient.signIn.email(data, {
      onSuccess: () => {
        router.push(decodedRedirectUrl);
      },
      onError: (ctx) => {
        setFormError('root', {
          message: ctx.error.message,
        });
      },
    });
  };

  return (
    <FormProvider {...form}>
      <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit(onSubmit)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-2xl">Login to your account</h1>
          <p className="text-balance text-muted-foreground text-sm">Enter your email below to login to your account</p>
        </div>
        {errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6">
          <div className="grid gap-2">
            <TextInput
              label="Email"
              control={control}
              name="email"
              id="email"
              type="email"
              placeholder="m@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <TextInput
              label="Password"
              control={control}
              name="password"
              id="password"
              type="password"
              autoComplete="password"
              aria-invalid={!!errors.password}
            />
            {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" {...register('rememberMe')} />
              <Label htmlFor="rememberMe">Remember me</Label>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Login'}
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href={`/auth/signup?redirectUrl=${decodedRedirectUrl}`} className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
    </FormProvider>
  );
}
