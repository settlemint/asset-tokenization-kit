'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server action to invalidate Next.js cache paths
 */
export async function revalidatePaths(paths: string[]) {
  for (const path of paths) {
    await Promise.resolve(revalidatePath(path));
  }
}
