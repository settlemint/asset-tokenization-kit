"use client";

import { SessionProvider } from "next-auth/react";
import type { PropsWithChildren } from "react";

export function SettleMintProvider({ children }: PropsWithChildren) {
  return <SessionProvider>{children}</SessionProvider>;
}
