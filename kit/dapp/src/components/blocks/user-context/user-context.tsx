'use client';

import { redirect } from '@/i18n/routing';
import { authClient } from '@/lib/auth/client';
import type { User } from '@/lib/auth/types';
import { useParams } from 'next/navigation';
import { createContext, useContext, type ReactNode } from 'react';
import type { Address, Prettify } from 'viem';

export const UserContext = createContext<Prettify<
  Omit<User, 'wallet'> & { wallet: Address }
> | null>(null);

export function UserContextProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const { locale } = useParams();

  // Show loading state while session is being fetched
  if (isPending) {
    return null;
  }

  // Redirect to sign in if no session is found
  if (!session?.user) {
    return redirect({
      href: '/auth/signin',
      locale: locale as string,
    });
  }

  const user = session.user as Prettify<
    Omit<User, 'wallet'> & { wallet: Address }
  >;

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
