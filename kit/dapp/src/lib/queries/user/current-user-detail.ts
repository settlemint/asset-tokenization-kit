"use server";

import { getUser } from "@/lib/auth/utils";
import { getUserDetail } from "@/lib/queries/user/user-detail";
export async function getCurrentUserDetail() {
  const user = await getUser();
  return getUserDetail({ id: user.id });
}
