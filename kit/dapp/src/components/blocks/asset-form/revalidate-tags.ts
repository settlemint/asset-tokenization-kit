'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateTags(tags: string[]) {
  tags.map((tag) => revalidateTag(tag));
}
