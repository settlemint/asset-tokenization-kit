import { auth } from "@/lib/auth/auth";
import { getQueryClient, HydrateClient } from "@/lib/query/hydrate-client";
import { prefetchSession } from "@daveyplate/better-auth-tanstack/server";
import { headers } from "next/headers";
import type { PropsWithChildren } from "react";

export default async function PrivateLayout({ children }: PropsWithChildren) {
  prefetchSession(auth, getQueryClient(), {
    headers: await headers(),
  });

  return <HydrateClient>{children}</HydrateClient>;
}
