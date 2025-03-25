"use client";
import {
  SearchIcon,
  type SearchIconHandle,
} from "@/components/ui/animated-icons/search";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Link } from "@/i18n/routing";
import { getAssetSearch } from "@/lib/queries/asset/asset-search";
import { getUserSearch } from "@/lib/queries/user/user-search";
import { cn } from "@/lib/utils";
import { sanitizeSearchTerm } from "@/lib/utils/string";
import { History } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import useSWR from "swr";
import { getAddress } from "viem";
import { EvmAddress } from "../evm-address/evm-address";

// Define types for recent items
type RecentAsset = {
  id: string;
  type: string;
  selectedAt: number;
};

type RecentUser = {
  id: string;
  wallet: string;
  selectedAt: number;
};

const MAX_RECENT_ITEMS = 5;
const RECENT_ASSETS_KEY = "recently-selected-search-assets";
const RECENT_USERS_KEY = "recently-selected-search-users";

export const Search = () => {
  const form = useForm({
    defaultValues: {
      search: "",
    },
    mode: "all",
  });

  const t = useTranslations("components.search");
  const searchIconRef = useRef<SearchIconHandle>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Get recent assets and users from local storage
  const [recentAssets, setRecentAssets] = useLocalStorage<RecentAsset[]>(
    RECENT_ASSETS_KEY,
    []
  );
  const [recentUsers, setRecentUsers] = useLocalStorage<RecentUser[]>(
    RECENT_USERS_KEY,
    []
  );

  const search = useWatch({
    control: form.control,
    name: "search",
  });
  const debounced = useDebounce(search, 250);
  const sanitizedSearchTerm = sanitizeSearchTerm(debounced);

  // Fetch users with SWR
  const { data: users, isLoading: isLoadingUsers } = useSWR(
    sanitizedSearchTerm ? [`user-search`, sanitizedSearchTerm] : null,
    async () => {
      const result = await getUserSearch({ searchTerm: sanitizedSearchTerm });
      return result || [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  // Fetch assets with SWR
  const { data: assets, isLoading: isLoadingAssets } = useSWR(
    sanitizedSearchTerm ? [`asset-search`, sanitizedSearchTerm] : null,
    async () => {
      const result = await getAssetSearch({ searchTerm: sanitizedSearchTerm });
      return result || [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  const isLoading = isLoadingUsers || isLoadingAssets;

  // Get URL segment based on asset type
  const getAssetUrlSegment = (type: string): string => {
    switch (type) {
      case "bond":
        return "bonds";
      case "cryptocurrency":
        return "cryptocurrencies";
      case "equity":
        return "equities";
      case "fund":
        return "funds";
      case "stablecoin":
        return "stablecoins";
      default:
        return type;
    }
  };

  // Add selected asset to recent assets
  const addToRecentAssets = useCallback(
    (asset: { id: string; type: string }) => {
      setRecentAssets((currentRecentAssets) => {
        const filteredAssets = currentRecentAssets.filter(
          (item) => item.id !== asset.id
        );
        const newRecentAssets = [
          { id: asset.id, type: asset.type, selectedAt: Date.now() },
          ...filteredAssets,
        ];
        return newRecentAssets.slice(0, MAX_RECENT_ITEMS);
      });
    },
    [setRecentAssets]
  );

  // Add selected user to recent users
  const addToRecentUsers = useCallback(
    (user: { id: string; wallet: string }) => {
      setRecentUsers((currentRecentUsers) => {
        const filteredUsers = currentRecentUsers.filter(
          (item) => item.id !== user.id
        );
        const newRecentUsers = [
          { id: user.id, wallet: user.wallet, selectedAt: Date.now() },
          ...filteredUsers,
        ];
        return newRecentUsers.slice(0, MAX_RECENT_ITEMS);
      });
    },
    [setRecentUsers]
  );

  // Show dropdown when input is focused with no search term
  const showInitialDropdown = isFocused && !debounced;

  return (
    <Form {...form}>
      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-visible rounded-md bg-popover text-popover-foreground"
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={cn(
            "flex items-center border border-b px-3 shadow-md focus-within:outline-hidden focus-within:ring-0 md:min-w-[450px]",
            debounced || showInitialDropdown ? "rounded-t-lg" : "rounded-lg"
          )}
          onMouseEnter={() => searchIconRef.current?.startAnimation()}
          onMouseLeave={() => searchIconRef.current?.stopAnimation()}
        >
          <SearchIcon
            ref={searchIconRef}
            className="mr-2 size-4 shrink-0 opacity-50"
          />
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder={t("placeholder")}
                    {...field}
                    className={cn(
                      "flex h-10 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground focus:outline-hidden focus:ring-0 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:min-w-[450px]"
                    )}
                    onChange={(e) => {
                      form.setValue("search", e.target.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
        {(debounced || showInitialDropdown) && (
          <div
            className={cn(
              "absolute top-full right-0 left-0 z-50 max-h-[300px] overflow-y-auto overflow-x-hidden rounded-b-lg border border-t-0 bg-popover shadow-md"
            )}
          >
            {isLoading && debounced && (
              <div className="p-2">
                <div className="overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">
                  {t("assets-section")}
                </div>
                {[1, 2].map((i) => (
                  <div key={i} className="px-2 py-1.5">
                    <Skeleton className="h-6 w-full bg-muted/50" />
                  </div>
                ))}
                <Separator className="my-1" />
                <div className="overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">
                  {t("users-section")}
                </div>
                {[1, 2].map((i) => (
                  <div key={i} className="px-2 py-1.5">
                    <Skeleton className="h-6 w-full bg-muted/50" />
                  </div>
                ))}
              </div>
            )}
            {debounced &&
              !isLoading &&
              (!assets || assets.length === 0) &&
              (!users || users.length === 0) && (
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground text-sm">
                    {t("no-results")}
                  </p>
                </div>
              )}

            {/* Show recent assets when focused with no search input */}
            {showInitialDropdown && recentAssets.length > 0 && (
              <>
                <div className="overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">
                  {t("recent-assets")}
                </div>
                {recentAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <History className="mr-2 h-4 w-4 opacity-50" />
                    <Link
                      href={`/assets/${getAssetUrlSegment(asset.type)}/${getAddress(asset.id)}`}
                      onClick={() => {
                        form.setValue("search", "", {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }}
                    >
                      <EvmAddress
                        address={asset.id as `0x${string}`}
                        verbose
                        hoverCard={false}
                      />
                    </Link>
                  </div>
                ))}
              </>
            )}

            {/* Show search results for assets */}
            {debounced && !isLoading && assets && assets.length > 0 && (
              <>
                <div className="overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">
                  {t("assets-section")}
                </div>
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <Link
                      href={`/assets/${getAssetUrlSegment(asset.type)}/${getAddress(asset.id)}`}
                      onClick={() => {
                        addToRecentAssets(asset);
                        form.setValue("search", "", {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }}
                    >
                      <EvmAddress
                        address={asset.id as `0x${string}`}
                        verbose
                        hoverCard={false}
                      />
                    </Link>
                  </div>
                ))}
              </>
            )}

            {/* Separator for sections */}
            {((debounced &&
              !isLoading &&
              users &&
              users.length > 0 &&
              assets &&
              assets.length > 0) ||
              (showInitialDropdown &&
                recentAssets.length > 0 &&
                recentUsers.length > 0)) && <Separator />}

            {/* Show recent users when focused with no search input */}
            {showInitialDropdown && recentUsers.length > 0 && (
              <>
                <div className="overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">
                  {t("recent-users")}
                </div>
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <History className="mr-2 h-4 w-4 opacity-50" />
                    <Link
                      href={`/platform/users/${user.id}`}
                      onClick={() => {
                        form.setValue("search", "", {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      <EvmAddress
                        address={user.wallet as `0x${string}`}
                        verbose
                        hoverCard={false}
                      />
                    </Link>
                  </div>
                ))}
              </>
            )}

            {/* Show search results for users */}
            {debounced && !isLoading && users && users.length > 0 && (
              <>
                <div className="overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">
                  {t("users-section")}
                </div>
                {users.map((user) => (
                  <div
                    key={user.wallet}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <Link
                      href={`/platform/users/${user.id}`}
                      onClick={() => {
                        addToRecentUsers(user);
                        form.setValue("search", "", {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      <EvmAddress
                        address={user.wallet as `0x${string}`}
                        verbose
                        hoverCard={false}
                      />
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
