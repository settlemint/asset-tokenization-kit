import NavInset from '@/components/layout/nav-inset';
import NavProvider from '@/components/layout/nav-provider';
import { redirect } from '@/i18n/routing';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import type { PropsWithChildren } from 'react';
import { AdminSidebar } from './_components/sidebar/sidebar';

export default async function AdminLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  const user = await getAuthenticatedUser(locale);
  if (!['admin', 'issuer'].includes(user.role ?? '')) {
    redirect({
      href: `/${locale}/auth/wrong-role`,
      locale,
    });
  }

  return (
    <NavProvider>
      <AdminSidebar />
      <NavInset>{children}</NavInset>
    </NavProvider>
  );
}
