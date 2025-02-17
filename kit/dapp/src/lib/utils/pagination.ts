/**
 * Fetches all pages of data from the API.
 * @param fetch - The function to fetch the data.
 * @param pageSize - The number of items to fetch per page (max 999).
 * @returns All the data from the API.
 */
export async function fetchAllPages<T>(
  fetch: (first: number, skip: number) => Promise<T[]>,
  pageSize = 999
): Promise<T[]> {
  if (pageSize > 999) {
    throw new Error('pageSize must be less than 1000');
  }
  const results: T[] = [];
  let hasMore = true;
  let skip = 0;
  const first = pageSize + 1; // +1 to check if there are more pages
  while (hasMore) {
    const data = await fetch(first, skip);
    results.push(...data.slice(0, pageSize)); // Remove last item as it's the check for more pages
    hasMore = data.length === first;
    skip += pageSize;
  }
  return results;
}
