/**
 * Sanitizes a URL for safe use in CSS url() functions.
 * Prevents CSS injection attacks by escaping special characters.
 *
 * @param url - The URL to sanitize
 * @returns Escaped URL safe for CSS injection
 */
export function sanitizeCssUrl(url: string): string {
  if (!url) {
    return "";
  }

  // Remove any existing url() wrapper if present
  let cleanUrl = url.trim();
  if (cleanUrl.startsWith("url(") && cleanUrl.endsWith(")")) {
    cleanUrl = cleanUrl.slice(4, -1).trim();
  }

  // Remove quotes if present
  if (
    (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) ||
    (cleanUrl.startsWith("'") && cleanUrl.endsWith("'"))
  ) {
    cleanUrl = cleanUrl.slice(1, -1);
  }

  // Escape special characters that could break CSS
  // Replace backslashes, quotes, parentheses, and other potentially dangerous characters
  const escaped = cleanUrl
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', '\\"')
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r");

  return escaped;
}

/**
 * Creates a safe CSS background-image value from a URL.
 *
 * @param url - The URL to use for the background image
 * @returns Safe CSS value in the format "url('escaped-url')"
 */
export function safeCssBackgroundImage(url: string): string {
  const sanitized = sanitizeCssUrl(url);
  return `url('${sanitized}')`;
}
