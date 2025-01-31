'use server';

import { revalidateTag } from 'next/cache';

type RevalidateResult = {
  success: boolean;
  error?: string;
};

/**
 * Server action to revalidate multiple cache tags
 * @param tags Array of cache tags to revalidate
 * @returns Result indicating success or failure of the revalidation
 * @throws {Error} If tags array is empty or contains invalid values
 */
// biome-ignore lint/suspicious/useAwait: <explanation>
export async function revalidateTags(tags: readonly string[]): Promise<RevalidateResult> {
  // Validate input
  if (!tags || tags.length === 0) {
    return { success: false, error: 'No tags provided for revalidation' };
  }

  try {
    // Use for...of for better type safety and error handling
    for (const tag of tags) {
      if (typeof tag !== 'string' || tag.trim() === '') {
        return { success: false, error: 'Invalid tag provided' };
      }
      revalidateTag(tag);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revalidate tags',
    };
  }
}
