// Regex for splitting on whitespace and separators
const SPLIT_PATTERN = /[\s_-]+/;

interface SlugifyOptions {
  /** Whether to append a unique suffix */
  unique?: boolean;
  /** Character to use as separator (default: '-') */
  separator?: string;
  /** Length of unique suffix if enabled (default: 5) */
  suffixLength?: number;
  /** Characters to use for unique suffix (default: alphanumeric) */
  suffixChars?: string;
  /** Whether to preserve unicode characters (default: false) */
  preserveUnicode?: boolean;
}

/**
 * Converts a string into a URL-friendly slug.
 *
 * @param text - The text to convert into a slug
 * @param options - Configuration options for slug generation
 * @returns A URL-friendly slug
 * @throws {Error} If text is not a string or options are invalid
 *
 * @example
 * ```ts
 * slugify('Hello World') // 'hello-world'
 * slugify('Hello World', { unique: true }) // 'hello-world-a1b2c'
 * slugify('Hello World', { separator: '_' }) // 'hello_world'
 * ```
 */
export function slugify(text: string, options: SlugifyOptions = {}): string {
  // Validate input
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const {
    unique = false,
    separator = '-',
    suffixLength = 5,
    suffixChars = '0123456789abcdefghijklmnopqrstuvwxyz',
    preserveUnicode = false,
  } = options;

  // Validate options
  if (suffixLength < 1) {
    throw new Error('suffixLength must be greater than 0');
  }
  if (suffixChars.length < 2) {
    throw new Error('suffixChars must contain at least 2 characters');
  }
  if (separator.length === 0) {
    throw new Error('separator cannot be empty');
  }

  // Handle unicode characters and create slug
  let slug = text.toLowerCase().trim();

  if (preserveUnicode) {
    // Basic sanitization for URLs while preserving unicode
    const unsafe = '"\'<>\\';
    slug = slug
      .split('')
      .filter((char) => !unsafe.includes(char))
      .join('');
  } else {
    // Normalize and remove diacritics
    slug = slug
      .normalize('NFKD')
      .split('')
      .filter((char) => {
        const code = char.charCodeAt(0);
        return (
          (code >= 97 && code <= 122) || // a-z
          (code >= 48 && code <= 57) || // 0-9
          code === 32 || // space
          code === 45 // hyphen
        );
      })
      .join('');
  }

  // Clean up separators
  slug = slug.split(SPLIT_PATTERN).filter(Boolean).join(separator);

  // Ensure we have a valid slug
  if (slug.length === 0) {
    slug = 'untitled';
  }

  // Add unique suffix if requested
  if (unique) {
    const suffix = Array.from(
      { length: suffixLength },
      () => suffixChars[Math.floor(Math.random() * suffixChars.length)]
    ).join('');
    return `${slug}${separator}${suffix}`;
  }

  return slug;
}
