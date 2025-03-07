"use client";
import {
  SearchIcon,
  type SearchIconHandle,
} from "@/components/ui/animated-icons/search";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";
import { Link } from "@/i18n/routing";
import type { Asset } from "@/lib/queries/asset/asset-fragment";
import { getAssetSearch } from "@/lib/queries/asset/asset-search";
import { getUserSearch } from "@/lib/queries/user/user-search";
import { cn } from "@/lib/utils";
import { sanitizeSearchTerm } from "@/lib/utils/string";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { getAddress } from "viem";
import { EvmAddress } from "../evm-address/evm-address";

// Client-side hooks to fetch search results
function useClientAssetSearch(searchTerm: string) {
  const [data, setData] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!searchTerm) {
        setData([]);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getAssetSearch({ searchTerm });
        if (isMounted) {
          setData(result || []);
        }
      } catch (error) {
        console.error("Error searching assets:", error);
        if (isMounted) {
          setData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  return { data, isLoading };
}

function useClientUserSearch(searchTerm: string) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getUserSearch>>>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!searchTerm) {
        setData([]);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getUserSearch({ searchTerm });
        if (isMounted) {
          setData(result || []);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        if (isMounted) {
          setData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  return { data, isLoading };
}

export const Search = () => {
  const form = useForm({
    defaultValues: {
      search: "",
    },
    mode: "all",
  });

  const t = useTranslations("components.search");
  const searchIconRef = useRef<SearchIconHandle>(null);

  const search = useWatch({
    control: form.control,
    name: "search",
  });
  const debounced = useDebounce(search, 250);
  const sanitizedSearchTerm = sanitizeSearchTerm(debounced);

  const { data: users } = useClientUserSearch(sanitizedSearchTerm);
  const { data: assets } = useClientAssetSearch(sanitizedSearchTerm);

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
            debounced ? "rounded-t-lg" : "rounded-lg"
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
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
        {debounced && (
          <div
            className={cn(
              "absolute top-full right-0 left-0 z-50 max-h-[300px] overflow-y-auto overflow-x-hidden rounded-b-lg border border-t-0 bg-popover shadow-md"
            )}
          >
            {(assets ?? []).length === 0 && (users ?? []).length === 0 && (
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground text-sm">
                  {t("no-results")}
                </p>
              </div>
            )}
            {(assets ?? []).length > 0 && (
              <>
                <div className="overflow-hidden p-1 px-2 py-1.5 font-medium text-muted-foreground text-xs">
                  {t("assets-section")}
                </div>
                {(assets ?? []).map((asset) => (
                  <div
                    key={asset.id}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                  >
                    <Link
                      href={`/admin/${getAssetUrlSegment(asset.type)}/${getAddress(asset.id)}`}
                      onClick={() => {
                        form.setValue("search", "", {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }}
                    >
                      <EvmAddress
                        address={asset.id}
                        verbose
                        hoverCard={false}
                      />
                    </Link>
                  </div>
                ))}
              </>
            )}
            {users && users.length > 0 && <Separator />}
            {users && users.length > 0 && (
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
                      href={`/admin/users/${user.id}`}
                      onClick={() => {
                        form.setValue("search", "", {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                      }}
                    >
                      <EvmAddress
                        address={user.wallet}
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
