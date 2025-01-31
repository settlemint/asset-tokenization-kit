import { AssetIcon } from '@/components/icons/assets';
import type { NavElement, NavItem } from '@/components/layout/nav-main';
import { PrivateSidebar } from '@/components/layout/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/lib/auth/auth';
import { AlertTriangle, ArrowRightLeft, LayoutDashboard, Settings, Users } from 'lucide-react';
import { headers } from 'next/headers';
import type { PropsWithChildren } from 'react';
import Header from '../../../components/layout/header';
import { getAssets } from './_lib/dynamic-navigation';

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const role = (session?.user?.role ?? 'user') as 'admin' | 'issuer' | 'user';
  const assets = await getAssets();

  const defaultNavItems: NavElement[] = [
    {
      label: 'Dashboard',
      icon: <LayoutDashboard />,
      path: '/admin',
    },
    {
      label: 'Actions',
      icon: <AlertTriangle />,
      path: '/actions',
      badge: '12',
    },
    {
      groupTitle: 'Token management',
      items: [
        {
          queryKey: 'cryptoCurrencies' as const,
          label: 'Crypto Currencies',
          path: 'cryptocurrencies',
          icon: <AssetIcon value="CC" />,
        },
        {
          queryKey: 'stableCoins' as const,
          label: 'Stable Coins',
          path: 'stablecoins',
          icon: <AssetIcon value="SC" />,
        },
        {
          queryKey: 'equities' as const,
          label: 'Equities',
          path: 'equities',
          icon: <AssetIcon value="EQ" />,
        },
        {
          queryKey: 'bonds' as const,
          label: 'Bonds',
          path: 'bonds',
          icon: <AssetIcon value="BN" />,
        },
      ].reduce<NavItem[]>((acc, section) => {
        const assetsOfSection = assets[section.queryKey];

        const subItems = assetsOfSection.slice(0, 5).map<NavItem>((asset) => ({
          label: asset.symbol ?? asset.name ?? asset.id,
          path: `/admin/${section.path}/${asset.id}`,
        }));

        if (assetsOfSection.length > 5) {
          subItems.push({
            label: 'More...',
            path: `/admin/${section.path}`,
          });
        }

        acc.push({
          ...section,
          label: section.label,
          path: `/admin/${section.path}`,
          badge: assetsOfSection.length.toString(),
          subItems,
        });
        return acc;
      }, []),
    },
    {
      label: 'User management',
      icon: <Users />,
      path: '/admin/users',
    },
    {
      label: 'Transactions',
      icon: <ArrowRightLeft />,
      path: '/transactions',
    },
    {
      label: 'Settings',
      icon: <Settings />,
      path: '/settings',
    },
  ];

  return (
    <SidebarProvider>
      <PrivateSidebar role={role} mode="admin" items={defaultNavItems} />
      <SidebarInset className="bg-sidebar">
        <Header />
        <main className="flex min-h-screen flex-1 flex-col gap-4 rounded-tl-xl bg-background p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
