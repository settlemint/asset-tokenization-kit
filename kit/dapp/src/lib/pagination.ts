/**
 * Fetches all pages of data from the API.
 * @param fetch - The function to fetch the data.
 * @param pageSize - The number of items to fetch per page.
 * @returns All the data from the API.
 */
async function fetchAllPages<T>(
  fetch: (first: number, skip: number) => Promise<T[]>,
  pageSize: number
): Promise<T[]> {
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

/**
 * Fetches all pages of data from the The Graph API.
 * @param fetch - The function to fetch the data.
 * @param pageSize - The number of items to fetch per page (max 999, default 999).
 * @returns All the data from the API.
 */
export function fetchAllTheGraphPages<T>(
  fetch: (first: number, skip: number) => Promise<T[]>,
  pageSize = 999
): Promise<T[]> {
  if (pageSize > 999) {
    throw new Error("pageSize must be less than 1000");
  }
  return fetchAllPages(fetch, pageSize);
}

/**
 * Fetches all pages of data from the Hasura API.
 * @param fetch - The function to fetch the data.
 * @param pageSize - The number of items to fetch per page (default 10,000).
 * @returns All the data from the API.
 */
export function fetchAllHasuraPages<T>(
  fetch: (limit: number, offset: number) => Promise<T[]>,
  pageSize = 10_000
): Promise<T[]> {
  return fetchAllPages(fetch, pageSize);
}

/**
 * Fetches all pages of data from the Portal API.
 * @param fetch - The function to fetch the data.
 * @param pageSize - The number of items to fetch per page (default 10,000).
 * @returns All the data from the API.
 */
export async function fetchAllPortalPages<T>(
  fetch: (props: {
    page: number;
    pageSize: number;
  }) => Promise<{ count: number; records: T[] }>,
  pageSize = 10_000
): Promise<{ count: number; records: T[] }> {
  const firstPage = await fetch({ page: 0, pageSize });
  const totalPages = Math.ceil(firstPage.count / pageSize);
  if (totalPages === 1) {
    return { count: firstPage.count, records: firstPage.records };
  }
  const results: T[] = [];
  for (let page = 1; page < totalPages; page++) {
    const pageData = await fetch({ page, pageSize });
    results.push(...pageData.records);
  }
  return { count: firstPage.count, records: results };
}
