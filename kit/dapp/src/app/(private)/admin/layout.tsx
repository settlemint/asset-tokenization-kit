import NavInset from '@/components/layout/nav-inset';
import NavProvider from '@/components/layout/nav-provider';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { AdminSidebar } from './_components/sidebar/sidebar';

export default async function AdminLayout({ children }: PropsWithChildren) {
  const user = await getAuthenticatedUser();
  if (!['admin', 'issuer'].includes(user.role ?? '')) {
    redirect('/auth/wrong-role');
  }

  return (
    <NavProvider>
      <AdminSidebar />
      <NavInset>{children}</NavInset>
    </NavProvider>
  );
}
