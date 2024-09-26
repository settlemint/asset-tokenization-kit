"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { signInAction } from "../actions/sign-in";
import { signInActionSchema } from "../schemas/sign-in-schema";

export function SignInForm({ provider }: { provider: string }) {
  const { form, handleSubmitWithAction } = useHookFormAction(signInAction, zodResolver(signInActionSchema), {
    actionProps: {},
    formProps: {},
    errorMapProps: {},
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="space-y-8">
        <input name="provider" type="hidden" value={provider} />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
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
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create an account</Button>
      </form>
    </Form>
  );
}
