import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface AssetDetailsTabProps {
  id: string;
  children?: ReactNode;
}

export function UserDetailsTabs({ id, children }: AssetDetailsTabProps) {
  return (
    <div className="UserDetailsTabs relative space-y-2">
      <Tabs defaultValue="details" className="">
        <TabsList className="mt-24 grid w-fit min-w-fit grid-cols-5 gap-x-5">
          <TabsTrigger value="details">
            <Link href={`/admin/users/${id}`}>Details</Link>
          </TabsTrigger>
          <TabsTrigger value="holdings">
            <Link href={`/admin/users/${id}/holdings`}>Holdings</Link>
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Link href={`/admin/users/${id}/transactions`}>Last Transactions</Link>
          </TabsTrigger>
          <TabsTrigger value="token-permissions">
            <Link href={`/admin/users/${id}/token-permissions`}>Token permissions</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">{children}</TabsContent>
      </Tabs>
    </div>
  );
}
