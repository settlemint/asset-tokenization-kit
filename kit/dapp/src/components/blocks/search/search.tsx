'use client';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from '@/hooks/use-debounce';
import { assetConfig } from '@/lib/config/assets';
import { sanitizeSearchTerm } from '@/lib/react-query';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { getAddress, isHex } from 'viem';
import { EvmAddress } from '../evm-address/evm-address';

const SearchUsers = hasuraGraphql(`
  query SearchUsers($search: String!) {
    user(where: {_or: [{name: {_ilike: $search}}, {wallet: {_ilike: $search}}, {email: {_like: $search}}]}) {
      wallet
      id
    }
  }
`);

const SearchAssets = theGraphGraphqlStarterkits(`
  query SearchAssets($searchAddress: Bytes!, $search: String!) {
    assets(
      where: {
        or: [
          {name_contains_nocase: $search},
          {symbol_contains_nocase: $search},
          {id: $searchAddress}
        ]
      }
    ) {
      id
      type
    }
  }
`);

export const Search = () => {
  const form = useForm({
    defaultValues: {
      search: '',
    },
    mode: 'all',
  });

  const search = useWatch({
    control: form.control,
    name: 'search',
  });
  const debounced = useDebounce(search, 250);

  const { data } = useQuery({
    queryKey: [`search-${debounced}`],
    queryFn: async () => {
      if (!debounced || debounced.length < 2) {
        return { assets: [], users: [] };
      }

      const sanitizedSearch = sanitizeSearchTerm(debounced);
      // If the sanitized search term is too short after cleaning, return empty results
      if (sanitizedSearch.length < 2) {
        return { assets: [], users: [] };
      }

      const users = await hasuraClient.request(SearchUsers, {
        search: `%${sanitizedSearch}%`,
      });

      const assets = await theGraphClientStarterkits.request(SearchAssets, {
        searchAddress: isHex(sanitizedSearch) ? sanitizedSearch : '',
        search: sanitizedSearch,
      });

      return {
        assets: assets.assets,
        users: users.user,
      };
    },
    enabled: debounced.length >= 2,
  });

  return (
    <Form {...form}>
      <div
        className={cn(
          'relative flex h-full w-full flex-col overflow-visible rounded-md bg-popover text-popover-foreground'
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={cn(
            'flex items-center border border-b px-3 shadow-md focus-within:outline-none focus-within:ring-0 md:min-w-[450px]',
            debounced ? 'rounded-t-lg' : 'rounded-lg'
          )}
        >
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Search for assets or users..."
                    {...field}
                    className={cn(
                      'flex h-10 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:min-w-[450px]'
                    )}
                    onChange={(e) => {
                      form.setValue('search', e.target.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
        {debounced && (
          <div
            className={cn(
              'absolute top-full right-0 left-0 z-50 max-h-[300px] overflow-y-auto overflow-x-hidden rounded-b-lg border border-t-0 bg-popover shadow-lg'
            )}
          >
            {!data ||
              (data.assets.length === 0 && data.users.length === 0 && (
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground text-sm">No results found</p>
                </div>
              ))}

            {data && data.assets.length > 0 && (
              <>
                <div className="overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">Assets</div>
                {data.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <Link
                      href={`/admin/${assetConfig[asset.type as keyof typeof assetConfig].urlSegment}/${getAddress(asset.id)}`}
                      onClick={() => {
                        form.setValue('search', '', {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      <EvmAddress address={asset.id} verbose hoverCard={false} />
                    </Link>
                  </div>
                ))}
              </>
            )}
            {data && data.assets.length > 0 && data.users.length > 0 && <Separator />}
            {data && data.users.length > 0 && (
              <>
                <div className="overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">Users</div>
                {data.users.map((user) => (
                  <div
                    key={user.wallet}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <Link
                      href={`/admin/users/${user.id}`}
                      onClick={() => {
                        form.setValue('search', '', {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      <EvmAddress address={user.wallet} verbose hoverCard={false} />
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </Form>
  );
};
