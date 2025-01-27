import { AssetTabDetail } from '@/components/blocks/asset-tabs/asset-details';
import CollapsedBreadcrumbs from '@/components/blocks/collapsed-breadcrumb/collapsed-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown } from 'lucide-react';
import { icons } from '../../_components/columns';
import { getStableCoins } from '../../_components/data';
export default async function StableCoinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <CollapsedBreadcrumbs
        routeSegments={['admin', 'stablecoins', id, 'details']}
        maxVisibleItems={4}
        hideRoot={true}
      />

      <div className="flex items-center justify-between gap-4 space-y-2">
        <div className="flex items-center gap-4 space-y-2">
          <h2 className="font-bold text-3xl tracking-tight">USD Coin (USDC)</h2>
          <Badge className="bg-green-600 text-white">Active</Badge>
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
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="holders">Holders</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="blocklist">Block list</TabsTrigger>
            <TabsTrigger value="token-permissions">Token permissions</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="">
            <AssetTabDetail
              type="stablecoin"
              dataAction={getStableCoins}
              cells={[]}
              icons={icons}
              refetchInterval={5000}
            />
          </TabsContent>
          {/* Dummy content */}
          <TabsContent value="holders" className="">
            <Card className="">
              <CardHeader>
                <CardTitle>Holders</CardTitle>
              </CardHeader>
              <CardContent className=" space-y-2">
                <div className="space-y-1">Holders</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events" className="">
            <Card className="">
              <CardHeader>
                <CardTitle>Events</CardTitle>
              </CardHeader>
              <CardContent className=" space-y-2">
                <div className="space-y-1">Events</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="blocklist" className="">
            <Card className="">
              <CardHeader>
                <CardTitle>Block list</CardTitle>
              </CardHeader>
              <CardContent className=" space-y-2">
                <div className="space-y-1">Block list</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="token-permissions" className="">
            <Card className="">
              <CardHeader>
                <CardTitle>Token permissions</CardTitle>
              </CardHeader>
              <CardContent className=" space-y-2">
                <div className="space-y-1">Token permissions</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
