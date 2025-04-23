"use server";

import { revalidateTag } from "next/cache";

/**
 * Revalidates the cache tag associated with user data.
 */
export async function revalidateUserCache() {
  revalidateTag("user");
}
