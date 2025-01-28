import { revalidateTag } from 'next/cache';

export function revalidateTags(tags: string[]) {
  tags.map((tag) => revalidateTag(tag));
}
