"use client";

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import type { CurrencyCode } from "@/lib/db/schema-settings";
import { updateCurrency } from "@/lib/mutations/user/update-currency";
import { Check, DollarSign } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// Currency display names mapping
const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  USD: "USD ($)",
  EUR: "EUR (€)",
  JPY: "JPY (¥)",
  AED: "AED (د.إ)",
  SGD: "SGD ($)",
  SAR: "SAR (﷼)",
};

// Available currencies
const AVAILABLE_CURRENCIES = Object.keys(CURRENCY_NAMES) as CurrencyCode[];

interface CurrencyMenuItemProps {
  defaultCurrency: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
}

export function CurrencyMenuItem({
  defaultCurrency = "EUR",
  onCurrencyChange,
}: CurrencyMenuItemProps) {
  const [currentCurrency, setCurrentCurrency] = useState(defaultCurrency);

  const handleCurrencyChange = useCallback(
    async (currency: CurrencyCode) => {
      if (currency === currentCurrency) return;

      try {
        // Call the server action to update currency
        await updateCurrency({ currency });

        // Update local state
        setCurrentCurrency(currency);

        // Call the callback if provided
        if (onCurrencyChange) {
          onCurrencyChange(currency);
        }

        toast.success(
          `Default currency changed to ${CURRENCY_NAMES[currency]}`
        );
      } catch (error) {
        toast.error("Failed to update default currency");
        console.error("Error updating default currency:", error);
      }
    },
    [currentCurrency, onCurrencyChange]
  );

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="p-2">
        <DollarSign className="mr-4 size-4 text-muted-foreground" />
        <span>{CURRENCY_NAMES[currentCurrency]}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-[8rem]">
        {AVAILABLE_CURRENCIES.map((currency) => (
          <DropdownMenuItem
            key={currency}
            className="dropdown-menu-item cursor-pointer justify-between gap-1 px-2 py-1.5 text-sm"
            onSelect={() => handleCurrencyChange(currency)}
            disabled={currency === currentCurrency}
          >
            {CURRENCY_NAMES[currency] || currency}
            {currency === currentCurrency && (
              <Check className="ml-auto size-4 opacity-100" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
