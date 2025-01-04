'use client';

import { Input } from '@/components/blocks/form/controls/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentPropsWithoutRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm({
  className,
  redirectUrl = '/',
  ...props
}: ComponentPropsWithoutRef<'form'> & { redirectUrl?: string }) {
  const decodedRedirectUrl = decodeURIComponent(redirectUrl);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        wallet: '', // will be filled in by the hook
      },
      {
        onSuccess: () => {
          router.push(decodedRedirectUrl);
        },
        onError: (ctx) => {
          setFormError('root', {
            message: ctx.error.message,
          });
        },
      }
    );
  };

  return (
    <form className={cn('flex flex-col gap-6', className)} onSubmit={handleSubmit(onSubmit)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-bold text-2xl">Create an account</h1>
        <p className="text-balance text-muted-foreground text-sm">Enter your email below to create your account</p>
      </div>
      {errors.root && (
        <Alert variant="destructive">
          <AlertDescription>{errors.root.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href={`/auth/signin?redirectUrl=${decodedRedirectUrl}`} className="underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </form>
  );
}
