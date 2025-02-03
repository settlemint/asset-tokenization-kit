'use server';

import { revalidateTag } from 'next/cache';

// biome-ignore lint/suspicious/useAwait: <explanation>
export async function invalidateCache(tags: string[]) {
  tags.map(revalidateTag);
}
