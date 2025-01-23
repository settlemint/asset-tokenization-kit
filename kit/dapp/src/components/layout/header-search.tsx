'use client';

import { Input } from '@/components/ui/input';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { authClient } from '@/lib/auth/client';
import type { User } from '@/lib/auth/types';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { useFuzzySearchList } from '@nozbe/microfuzz/react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

const SearchAssetsQuery = theGraphGraphqlStarterkits(`
  query SearchAssets {
    assets {
      id
      name
      symbol
    }
  }
`);

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: session } = authClient.useSession();

  const { data: users = [] } = useQuery({
    queryKey: ['search-users', session?.user.role],
    queryFn: async () => {
      if (session?.user.role !== 'admin') {
        return [];
      }

      try {
        const result = await authClient.admin.listUsers({
          query: {
            limit: Number.MAX_SAFE_INTEGER,
          },
        });

        return (result.data?.users ?? []) as User[];
      } catch {
        return [];
      }
    },
  });

  const { data: assets = [] } = useQuery({
    queryKey: ['search-assets'],
    queryFn: async () => {
      try {
        const { assets } = await theGraphClientStarterkits.request(SearchAssetsQuery);
        return assets ?? [];
      } catch {
        return [];
      }
    },
  });

  const filteredUsers = useFuzzySearchList({
    list: users,
    queryText: search,
    getText: (user) => [user.name ?? '', user.email ?? '', user.wallet],
    strategy: 'smart',
    mapResultItem: (result) => ({ main: result.item.name ?? '', sub: result.item.email ?? '', id: result.item.id }),
  });

  const filteredAssets = useFuzzySearchList({
    list: assets,
    queryText: search,
    getText: (asset) => [asset.name ?? '', asset.symbol ?? '', asset.id],
    strategy: 'smart',
    mapResultItem: (result) => ({ main: result.item.name ?? '', sub: result.item.symbol ?? '', id: result.item.id }),
  });

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Anchor>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => setOpen(e.key !== 'Escape')}
            onMouseDown={() => setOpen((open) => !!search || !open)}
            onFocus={() => setOpen(true)}
            onBlur={(e) => {
              if (!e.relatedTarget?.closest('[role="combobox"]')) {
                setSearch('');
              }
            }}
            placeholder="Search users and assets..."
            className="w-[400px]"
            role="combobox"
            aria-expanded={open}
            aria-controls="search-results"
            aria-autocomplete="list"
          />
        </PopoverPrimitive.Anchor>
        <PopoverContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (e.target instanceof Element && e.target.closest('input')) {
              e.preventDefault();
            }
          }}
          className="w-[--radix-popover-trigger-width] p-0"
        >
          <div id="search-results" className="max-h-[300px] overflow-y-auto" role="presentation">
            {filteredUsers.length === 0 && filteredAssets.length === 0 && (
              <div className="py-6 text-center text-sm">Nothing found.</div>
            )}
            {filteredUsers.length > 0 && (
              <div className="p-1">
                <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">Users</div>
                {filteredUsers.slice(0, 5).map((result) => (
                  <Link
                    key={result.id}
                    href={`/admin/users/${result.id}`}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen(false)}
                    prefetch
                  >
                    {result.main} <span className="ml-auto text-muted-foreground text-xs">{result.sub}</span>
                  </Link>
                ))}
              </div>
            )}
            {filteredAssets.length > 0 && (
              <div className="p-1">
                <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs">Assets</div>
                {filteredAssets.slice(0, 5).map((result) => (
                  <Link
                    key={result.id}
                    href={`/assets/${result.id}`}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen(false)}
                    prefetch
                  >
                    {result.main} <span className="ml-auto text-muted-foreground text-xs">{result.sub}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
