import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TokenTypeValue } from '@/types/token-types';
import Link from 'next/link';

interface AssetDetailsTabProps {
  id: string;
  type: TokenTypeValue;
  children?: React.ReactNode;
}

export function AssetDetailsTabs({ id, type, children }: AssetDetailsTabProps) {
  return (
    <div className="AssetDetailsTabs relative space-y-2">
      <Tabs defaultValue="details" className="">
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
