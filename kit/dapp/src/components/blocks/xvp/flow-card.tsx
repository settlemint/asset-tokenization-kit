import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/number";
import { useLocale } from "next-intl";
import type { ReactElement } from "react";
import type { Address } from "viem";

interface FlowCardProps {
  from: Address;
  to: Address;
  amount: string | number;
  asset: {
    symbol: string;
    decimals: number;
    address?: Address;
  };
  className?: string;
}

export function FlowCard({
  from,
  to,
  amount,
  asset,
  className,
}: FlowCardProps): ReactElement {
  const locale = useLocale();

  return (
    <div className={cn("pt-2 pb-4", className)}>
      {/* Asset amount displayed at the top as a badge */}
      <div className="mb-2">
        <Badge variant="outline" className="text-sm">
          <span className="mr-1">
            {formatNumber(amount, {
              locale,
              decimals: asset.decimals,
              token: asset.symbol,
            })}
          </span>
          <EvmAddress
            address={asset.address!}
            symbol={asset.symbol}
            hoverCard
          />
        </Badge>
      </div>

      {/* Two-column grid layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* From section - left column */}
        <div className="flex flex-col items-start">
          <div className="flex h-6 items-center">
            <span className="text-xs text-muted-foreground">From</span>
          </div>
          <EvmAddress
            address={from}
            prefixLength={6}
            suffixLength={4}
            hoverCard
          />
        </div>

        {/* To section - left aligned in right column */}
        <div className="flex flex-col items-start">
          <div className="flex h-6 items-center">
            <span className="text-xs text-muted-foreground">To</span>
          </div>
          <EvmAddress
            address={to}
            prefixLength={6}
            suffixLength={4}
            hoverCard
          />
        </div>
      </div>
    </div>
  );
}
