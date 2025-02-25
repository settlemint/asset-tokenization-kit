import { UserContextProvider } from '@/components/blocks/user-context/user-context';
import type { PropsWithChildren } from 'react';

export default function PrivateLayout({ children }: PropsWithChildren) {
  return <UserContextProvider>{children}</UserContextProvider>;
}
