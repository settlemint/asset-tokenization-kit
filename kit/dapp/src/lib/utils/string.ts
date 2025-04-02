/**
 * Sanitizes a search term for safe use in database queries
 * @param search The raw search term
 * @returns The sanitized search term
 */
export function sanitizeSearchTerm(search: string): string {
  // Return empty string for undefined/null values
  if (!search) return "";

  // Trim the search term
  const trimmed = search.trim();

  // Special case for numeric-only search terms (preserve them exactly as-is)
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // Remove any non-alphanumeric characters except spaces and common symbols
  const cleaned = trimmed
    // Escape backslashes
    .replace(/\\/g, "\\\\")
    // Allow letters, numbers, spaces, and common symbols
    .replace(/[^a-zA-Z0-9\s@$._-]/g, "")
    // Replace multiple spaces with single space
    .replace(/\s+/g, " ")
    // Escape special characters used in LIKE patterns
    .replace(/[%_]/g, "\\$&")
    .trim();

  return cleaned;
}
