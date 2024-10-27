"use server";

import { signIn } from "@/lib/auth/auth";
import { actionClient } from "@/lib/safe-action";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const signInAction = actionClient
  .schema(
    zfd.formData({
      username: zfd.text(z.string().email()),
      password: zfd.text(z.string().min(6)),
      provider: zfd.text(z.string()),
      redirectUrl: zfd.text(z.string().optional()),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      const { provider, redirectUrl, ...formData } = parsedInput;
      const decodedRedirectUrl = redirectUrl ? decodeURIComponent(redirectUrl) : undefined;
      return await signIn(provider, {
        ...formData,
        redirectTo: decodedRedirectUrl ?? "/",
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return redirect(`/auth/error?error=${error.type}`);
      }
      throw error;
    }
  });
