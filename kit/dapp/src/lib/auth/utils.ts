import { auth } from "@/lib/auth/auth";
import { prefetchSession } from "@daveyplate/better-auth-tanstack/server";
import { headers } from "next/headers";
import { getQueryClient } from "../query/hydrate-client";
import type { User } from "./types";

export const getUser = async (): Promise<User> => {
  const queryClient = getQueryClient();
  const { user } = await prefetchSession(auth, queryClient, {
    headers: await headers(),
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user as User;
};
