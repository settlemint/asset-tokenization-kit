"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useTokenDetails } from "./_queries/token-details";

export default function WalletTokenDetailLayout({ children }: PropsWithChildren) {
  const params = useParams();
  const address = params.address as string;

  const { data } = useTokenDetails(address);

  return (
    <div>
      <h1>
        {data.erc20Contract?.name} ({data.erc20Contract?.symbol} @ {address})
      </h1>
      <div className="mt-4 mb-4 p-1 bg-primary rounded-md">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href={`/wallet/tokens/${address}/details`} legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle())}>Details</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href={`/wallet/tokens/${address}/holders`} legacyBehavior passHref>
                <NavigationMenuLink className={cn(navigationMenuTriggerStyle())}>Holders</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {children}
    </div>
  );
}
