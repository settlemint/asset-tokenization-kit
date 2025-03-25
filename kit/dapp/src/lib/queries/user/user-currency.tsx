"use server";

import { getUser } from "@/lib/auth/utils";
import { DEFAULT_SETTINGS, SETTING_KEYS } from "@/lib/db/schema-settings";
import { getUserDetail } from "@/lib/queries/user/user-detail";
import { cache } from "react";

export const getCurrentUserCurrency = cache(async () => {
  try {
    const user = await getUser();
    const userDetails = await getUserDetail({ id: user.id });
    return userDetails?.currency;
  } catch {
    return DEFAULT_SETTINGS[SETTING_KEYS.BASE_CURRENCY];
  }
});
