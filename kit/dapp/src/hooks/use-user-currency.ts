"use client";

import { authClient } from "@/lib/auth/client";
import { DEFAULT_SETTINGS, type CurrencyCode } from "@/lib/db/schema-settings";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { useEffect, useState } from "react";

export function useUserCurrency(): {
  userCurrency: CurrencyCode;
} {
  const [value, setValue] = useState<CurrencyCode>(
    DEFAULT_SETTINGS.baseCurrency
  );
  const { data } = authClient.useSession();

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        if (!data?.user) return;
        const userDetails = await getUserDetail({ id: data.user.id });
        const currency = userDetails?.currency;
        setValue(currency);
      } catch (error) {
        console.error("Failed to load setting:", error);
      }
    };
    void loadCurrency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { userCurrency: value };
}
