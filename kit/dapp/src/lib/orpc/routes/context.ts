import { auth } from "@/lib/auth/auth";
import type { db } from "@/lib/db";

export type Context = {
  headers: Headers;
  auth?: Awaited<ReturnType<typeof auth.api.getSession>>;
  db?: typeof db;
};
