"use client";

import { DEFAULT_SETTINGS, type CurrencyCode } from "@/lib/db/schema-settings";
import { getCurrentUserCurrency } from "@/lib/queries/user/user-currency";
import { useEffect, useState } from "react";

export function useUserCurrency(): {
  userCurrency: CurrencyCode;
} {
  const [value, setValue] = useState<CurrencyCode>(
    DEFAULT_SETTINGS.baseCurrency
  );
  const loadCurrency = async () => {
    try {
      const result = await getCurrentUserCurrency();
      setValue(result);
    } catch (error) {
      console.error("Failed to load setting:", error);
    }
  };

  useEffect(() => {
    void loadCurrency();
  }, []);

  return { userCurrency: value };
}
