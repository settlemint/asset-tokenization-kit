"use client";

import { authClient } from "@/lib/auth/client";
import { DEFAULT_SETTINGS, type CurrencyCode } from "@/lib/db/schema-settings";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { useEffect, useState } from "react";

export function useUserCurrency(): CurrencyCode {
  const [value, setValue] = useState<CurrencyCode>(
    DEFAULT_SETTINGS.baseCurrency
  );
  const { data: user } = authClient.useSession();

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        if (!user?.user.id) {
          return;
        }
        const result = await getUserDetail({ id: user.user.id });
        setValue(result.currency);
      } catch (error) {
        console.error("Failed to load setting:", error);
      }
    };

    void loadCurrency();
  }, [user]);

  return value;
}
