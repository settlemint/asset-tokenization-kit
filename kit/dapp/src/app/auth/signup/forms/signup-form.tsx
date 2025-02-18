'use client';

import { OTPInput } from '@/components/blocks/otp-input/otp-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth/client';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    walletPincode: z.string().length(6, 'PIN code must be exactly 6 digits'),
    walletPincodeConfirm: z.string().length(6, 'PIN code must be exactly 6 digits'),
  })
  .refine((data) => data.walletPincode === data.walletPincodeConfirm, {
    message: "PIN codes don't match",
    path: ['walletPincodeConfirm'],
  });

const SetPinCode = portalGraphql(`
  mutation SetPinCode($name: String!, $address: String!, $pincode: String!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: {pincode: {name: $name, pincode: $pincode}}
    ) {
      id
      name
      parameters
      verificationType
    }
  }
`);

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm({
  className,
  redirectUrl = '/',
  ...props
}: ComponentPropsWithoutRef<'form'> & { redirectUrl?: string }) {
  const decodedRedirectUrl = decodeURIComponent(redirectUrl);
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      walletPincode: '',
      walletPincodeConfirm: '',
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
        onSuccess: async () => {
          try {
            const session = await authClient.getSession();
            if (!session.data?.user.wallet) {
              form.setError('root', {
                message: 'No wallet address found',
              });
              return;
            }
            await portalClient.request(SetPinCode, {
              name: data.name,
              address: session.data.user.wallet,
              pincode: data.walletPincode,
            });
            // Check user role and redirect accordingly
            const userRole = session.data.user.role;
            const isAdminOrIssuer = userRole === 'issuer' || userRole === 'admin';
            const adminRedirect = decodedRedirectUrl.trim() || '/admin';
            const targetUrl = isAdminOrIssuer ? adminRedirect : '/portfolio';
            // Force a full page refresh to ensure new auth state is recognized
            window.location.replace(targetUrl);
          } catch (err) {
            const error = err as Error;
            form.setError('root', {
              message: `Unexpected error: ${error.message}`,
            });
          }
        },
        onError: (ctx) => {
          form.setError('root', {
            message: ctx.error.message,
          });
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
        {...props}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-2xl">Create an account</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Enter the information below to create your account and managed blockchain wallet
          </p>
        </div>
        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{form.formState.errors.root.message?.toString() || 'An error occurred'}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Warren Buffett Jr."
                    autoComplete="name"
                    required
                    minLength={1}
                    maxLength={100}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="wolf@wallstreet.com" autoComplete="email" required {...field} />
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
                  <Input type="password" autoComplete="new-password" required minLength={6} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="walletPincode"
            render={({ field }) => (
              <FormItem data-testid="wallet-pin-field">
                <FormLabel>Choose a secure wallet PIN code</FormLabel>
                <FormControl>
                  <OTPInput value={field.value} onChange={field.onChange} data-testid="wallet-pin-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="walletPincodeConfirm"
            render={({ field }) => (
              <FormItem data-testid="wallet-pin-confirm-field">
                <FormLabel>Confirm wallet PIN code</FormLabel>
                <FormControl>
                  <OTPInput value={field.value} onChange={field.onChange} data-testid="wallet-pin-confirm-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
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
          <Link href={`/auth/signin?rd=${decodedRedirectUrl}`} className="underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
