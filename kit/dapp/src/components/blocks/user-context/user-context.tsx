'use client';

import { authClient } from '@/lib/auth/client';
import type { User } from '@/lib/auth/types';
import { createContext, useContext, type ReactNode } from 'react';
import type { Address, Prettify } from 'viem';

export const UserContext = createContext<Prettify<
  Omit<User, 'wallet'> & { wallet: Address }
> | null>(null);

export function UserContextProvider({ children }: { children: ReactNode }) {
  const session = authClient.useSession();
  const user = session?.data?.user as Prettify<
    Omit<User, 'wallet'> & { wallet: Address }
  > | null;

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): Prettify<
  Omit<User, 'wallet'> & { wallet: Address }
> | null {
  const context = useContext(UserContext);
  if (!context) {
    return null;
  }
  return context;
}
