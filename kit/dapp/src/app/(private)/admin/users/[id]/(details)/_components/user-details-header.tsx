import type { DetailUser } from '@/app/(private)/admin/users/[id]/(details)/_components/data';
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

interface UserDetailsHeaderProps {
  data: DetailUser;
}

export function UserDetailsHeader({ data }: UserDetailsHeaderProps) {
  return (
    <div className="UserDetailsHeader absolute top-0 right-0 left-0 flex flex-col">
      <CollapsedBreadcrumbs routeSegments={['admin', 'users', data.id, 'details']} hideRoot={true} />
      <div className="flex items-center justify-between gap-4 space-y-2">
        <div className="mt-2 flex items-center gap-4 space-y-2">
          <h2 className="mb-6font-bold text-3xl tracking-tight">{data.name}</h2>
          {data.banned ? (
            <Badge variant="destructive">Banned</Badge>
          ) : (
            <Badge className="pointer-events-none bg-green-600 text-white">Active</Badge>
          )}
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="flex items-center gap-2">
                <span>Edit User</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[--radix-dropdown-menu-trigger-width] min-w-48 rounded-xl shadow-dropdown"
            >
              <DropdownMenuItem className="dropdown-menu-item">Change User Role</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
