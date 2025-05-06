"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateCaches() {
  // Revalidate all cache tags
  revalidateTag("asset");
  revalidateTag("user-activity");
  // Now revalidate paths after clearing cache
  revalidatePath("/[locale]/assets", "layout");
  revalidatePath("/[locale]/portfolio", "layout");
}
