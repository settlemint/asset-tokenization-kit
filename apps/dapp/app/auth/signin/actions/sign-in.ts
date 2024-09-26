"use server";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signInAction(provider: string, formData: FormData) {
  try {
    await signIn(provider, formData);
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect(`/auth/error?error=${error.type}`);
    }
    throw error;
  }
}
