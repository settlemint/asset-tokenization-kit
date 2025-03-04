/**
 * Sanitizes a search term for safe use in database queries
 * @param search The raw search term
 * @returns The sanitized search term
 */
export function sanitizeSearchTerm(search: string): string {
  // Remove any non-alphanumeric characters except spaces and common symbols
  const cleaned = search
    .trim()
    // Allow letters, numbers, spaces, and common symbols
    .replace(/[^a-zA-Z0-9\s@._-]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Escape special characters used in LIKE patterns
    .replace(/[%_]/g, '\\$&');

  return cleaned;
}