import { auth } from "@/lib/auth/auth";
import type { NextRequest } from "next/server";

export async function createContext(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return {
    auth: session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export type AuthenticatedContext = {
  auth: NonNullable<Context["auth"]>;
};
