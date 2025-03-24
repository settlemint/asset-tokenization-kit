"use client";

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import { updateCurrency } from "@/lib/mutations/user/update-currency";
import type { User } from "@/lib/queries/user/user-fragment";
import { Check, DollarSign } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

// Currency display names mapping
const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  USD: "USD ($)",
  EUR: "EUR (€)",
  JPY: "JPY (¥)",
  AED: "AED (د.إ)",
  SGD: "SGD ($)",
  SAR: "SAR (﷼)",
  GBP: "GBP (£)",
  CHF: "CHF (₣)",
};

// Available currencies
const AVAILABLE_CURRENCIES = Object.keys(CURRENCY_NAMES) as CurrencyCode[];

interface CurrencyMenuItemProps {
  user: User;
}

export function CurrencyMenuItem({ user }: CurrencyMenuItemProps) {
  const handleCurrencyChange = useCallback(
    async (currency: CurrencyCode) => {
      if (currency === user.currency) return;

      try {
        // Call the server action to update currency
        await updateCurrency({ currency });

        toast.success(
          `Default currency changed to ${CURRENCY_NAMES[currency]}`
        );
      } catch (error) {
        toast.error("Failed to update default currency");
        console.error("Error updating default currency:", error);
      }
    },
    [user.currency]
  );

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="p-2">
        <DollarSign className="mr-4 size-4 text-muted-foreground" />
        <span>{CURRENCY_NAMES[user.currency]}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-[8rem]">
        {AVAILABLE_CURRENCIES.map((currency) => (
          <DropdownMenuItem
            key={currency}
            className="dropdown-menu-item cursor-pointer justify-between gap-1 px-2 py-1.5 text-sm"
            onSelect={() => handleCurrencyChange(currency)}
            disabled={currency === user.currency}
          >
            {CURRENCY_NAMES[currency] || currency}
            {currency === user.currency && (
              <Check className="ml-auto size-4 opacity-100" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
