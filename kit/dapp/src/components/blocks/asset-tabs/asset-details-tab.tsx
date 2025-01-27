import CollapsedBreadcrumbs from '@/components/blocks/collapsed-breadcrumb/collapsed-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {} from '@/components/ui/card';
import {} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface AssetDetailsTabProps {
  data: {
    id: string;
    name: string | null;
    paused: boolean;
  };
  children?: React.ReactNode;
}

export function AssetDetailsTab({ data, children }: AssetDetailsTabProps) {
  return (
    <>
      <CollapsedBreadcrumbs routeSegments={['admin', 'stablecoins', data.id, 'details']} hideRoot={true} />

      <div className="flex items-center justify-between gap-4 space-y-2">
        <div className="flex items-center gap-4 space-y-2">
          <h2 className="font-bold text-3xl tracking-tight">{data.name}</h2>
          <Badge className="pointer-events-none bg-green-600 text-white">{data.paused ? 'Paused' : 'Active'}</Badge>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
                <span>Mint Tokens</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="px-4">
              <DropdownMenuItem>Mint Tokens</DropdownMenuItem>
              <DropdownMenuItem>Burn Tokens</DropdownMenuItem>
              <DropdownMenuItem>Update proven collateral</DropdownMenuItem>
              <DropdownMenuItem>Pause contract</DropdownMenuItem>
              <hr />
              <DropdownMenuItem>Add token admin</DropdownMenuItem>
              <DropdownMenuItem>Block user</DropdownMenuItem>
              <DropdownMenuItem>Freeze user tokens</DropdownMenuItem>
              <hr />
              <DropdownMenuItem>View transactions</DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground">Create sale</DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground">Create swap</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2">
        <Tabs defaultValue="details" className="">
          <TabsList className="grid w-fit min-w-fit grid-cols-5 gap-x-5">
            <TabsTrigger value="details">
              <Link href={`/admin/stablecoins/${data.id}/details`}>Details</Link>
            </TabsTrigger>
            <TabsTrigger value="holders">
              <Link href={`/admin/stablecoins/${data.id}/holders`}>Holders</Link>
            </TabsTrigger>
            <TabsTrigger value="events">
              <Link href={`/admin/stablecoins/${data.id}/events`}>Events</Link>
            </TabsTrigger>
            <TabsTrigger value="blocklist">
              <Link href={`/admin/stablecoins/${data.id}/blocklist`}>Block list</Link>
            </TabsTrigger>
            <TabsTrigger value="token-permissions">
              <Link href={`/admin/stablecoins/${data.id}/token-permissions`}>Token permissions</Link>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="">
            {children}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
