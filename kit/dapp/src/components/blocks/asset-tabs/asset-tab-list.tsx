import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TokenTypeValue } from '@/types/token-types';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface AssetDetailsTabProps {
  id: string;
  type: TokenTypeValue;
  children?: ReactNode;
  activeTab: string;
}

export function AssetTabList({ id, type, children, activeTab }: AssetDetailsTabProps) {
  return (
    <div className="AssetTabList relative space-y-2">
      <Tabs defaultValue={activeTab} className="">
        <TabsList className="mt-24 grid w-fit min-w-fit grid-cols-5 gap-x-5">
          <TabsTrigger value="details">
            <Link href={`/admin/stablecoins/${id}`}>Details</Link>
          </TabsTrigger>
          <TabsTrigger value="holders">
            <Link href={`/admin/stablecoins/${id}/holders`}>Holders</Link>
          </TabsTrigger>
          <TabsTrigger value="events">
            <Link href={`/admin/stablecoins/${id}/events`}>Events</Link>
          </TabsTrigger>
          <TabsTrigger value="blocklist">
            <Link href={`/admin/stablecoins/${id}/blocklist`}>Block list</Link>
          </TabsTrigger>
          <TabsTrigger value="token-permissions">
            <Link href={`/admin/stablecoins/${id}/token-permissions`}>Token permissions</Link>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">{children}</TabsContent>
      </Tabs>
    </div>
  );
}
