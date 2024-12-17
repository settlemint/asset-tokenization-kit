'use client';

import { Input } from '@/components/blocks/form/controls/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import Link from 'next/link';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { signInAction } from '../actions/sign-in';

export function SignInForm({ provider, redirectUrl }: { provider: string; redirectUrl?: string }) {
  const { form, handleSubmitWithAction, resetFormAndAction } = useHookFormAction(
    signInAction,
    zodResolver(
      zfd.formData({
        username: zfd.text(z.string().email()),
        password: zfd.text(z.string().min(6)),
        provider: zfd.text(z.string()),
        redirectUrl: zfd.text(z.string().optional()),
      })
    ),
    {
      actionProps: {
        onSuccess: () => {
          resetFormAndAction();
        },
      },
      formProps: {
        mode: 'onChange',
        defaultValues: {
          username: '',
          password: '',
          provider,
          redirectUrl,
        },
      },
      errorMapProps: {},
    }
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@settlemint.com" {...field} />
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
              <FormLabel className="flex items-center">
                Password
                <Link href="/auth/forgot-password" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Log in</Button>
      </form>
    </Form>
  );
}
