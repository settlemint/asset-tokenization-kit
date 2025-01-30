import CollapsedBreadcrumbs from '@/components/blocks/collapsed-breadcrumb/collapsed-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface AssetDetailsTabProps {
  data: {
    id: string;
    name: string | null;
    paused: boolean;
  };
}

export function AssetTabHeader({ data }: AssetDetailsTabProps) {
  return (
    <div className="AssetTabHeader absolute top-0 right-0 left-0 flex flex-col">
      <CollapsedBreadcrumbs routeSegments={['admin', 'stablecoins', data.id, 'details']} hideRoot={true} />
      <div className="flex items-center justify-between gap-4 space-y-2">
        <div className="mt-2 flex items-center gap-4 space-y-2">
          <h2 className="font-bold text-3xl tracking-tight">{data.name}</h2>
          <Badge className="pointer-events-none bg-green-600 text-white">{data.paused ? 'Paused' : 'Active'}</Badge>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
                <span>Mint Assets</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="px-4">
              <DropdownMenuItem>Mint Assets</DropdownMenuItem>
              <DropdownMenuItem>Burn Assets</DropdownMenuItem>
              <DropdownMenuItem>Update proven collateral</DropdownMenuItem>
              <DropdownMenuItem>Pause contract</DropdownMenuItem>
              <hr />
              <DropdownMenuItem>Add token admin</DropdownMenuItem>
              <DropdownMenuItem>Block user</DropdownMenuItem>
              <DropdownMenuItem>Freeze user Assets</DropdownMenuItem>
              <hr />
              <DropdownMenuItem>View transactions</DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground">Create sale</DropdownMenuItem>
              <DropdownMenuItem className="text-muted-foreground">Create swap</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
