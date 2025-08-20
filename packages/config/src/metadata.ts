/**
 * SEO Metadata Configuration
 *
 * This module provides centralized SEO metadata configuration for the application,
 * including default meta tags, Open Graph properties, and Twitter Card data.
 * It ensures consistent branding and search engine optimization across all pages.
 *
 * The module exports:
 * - Default metadata constants for the application
 * - A utility function for generating page-specific meta tags
 * @see {@link https://ogp.me/} - Open Graph Protocol documentation
 * @see {@link https://developer.twitter.com/en/docs/twitter-for-websites/cards} - Twitter Cards documentation
 */

/**
 * Default application metadata.
 *
 * Contains the base metadata used throughout the application for SEO and social sharing.
 * These values serve as defaults that can be overridden on specific pages.
 */
export const metadata = {
  /**
   * Default page title.
   * Used as the base title for all pages and appended to page-specific titles.
   */
  title: `Asset Tokenization Kit | SettleMint`,

  /**
   * Default meta description.
   * Brief description of the application for search engine results.
   */
  description: "SettleMint",

  /**
   * Twitter handle for the application.
   * Used in Twitter Card meta tags for attribution.
   */
  twitter: "@settlemintcom",

  /**
   * Default keywords for SEO.
   * Array of relevant terms that describe the application's purpose and features.
   */
  keywords: [
    "Asset Tokenization",
    "SettleMint",
    "Tokenization",
    "Asset Tokenization Kit",
    "Digital Assets",
    "SMART protocol",
    "ERC-3643",
    "Bonds",
    "Stablecoins",
    "Funds",
    "Deposits",
    "Equity",
  ],

  /**
   * Default Open Graph image path.
   * Relative path to the image used when sharing links on social media.
   */
  og: "/og.png",
};

/**
 * Generates SEO meta tags for a specific page.
 *
 * This function creates a comprehensive set of meta tags by combining page-specific
 * metadata with application defaults. It generates tags for:
 * - Standard HTML meta tags (title, description, keywords)
 * - Open Graph protocol tags for rich social media previews
 * - Twitter Card tags for enhanced Twitter sharing
 *
 * The function intelligently merges page-specific values with defaults:
 * - Titles are appended to the base application title
 * - Keywords are combined with default keywords
 * - Missing values fall back to application defaults
 * @example
 * ```tsx
 * // In a route file
 * export const Route = createFileRoute('/products/$id')({
 *   meta: ({ params }) => seo({
 *     title: `Product ${params.id}`,
 *     description: 'View detailed information about this tokenized asset',
 *     keywords: ['product', 'asset', 'details'],
 *     image: '/products/og-image.png'
 *   })
 * })
 *
 * // Using only some parameters
 * export const Route = createFileRoute('/about')({
 *   meta: () => seo({
 *     title: 'About Us',
 *     description: 'Learn more about our asset tokenization platform'
 *   })
 * })
 * ```
 */
export const seo = ({
  title,
  description,
  keywords,
  image,
}: {
  title?: string;
  description?: string;
  image?: string;
  keywords?: string[];
}) => {
  // Merge page-specific values with defaults
  const resolvedTitle = title ? `${title} | ${metadata.title}` : metadata.title;
  const resolvedDescription = description ?? metadata.description;
  const resolvedImage = image ?? metadata.og;
  const resolvedKeywords = [...metadata.keywords, ...(keywords ?? [])].join(
    ", "
  );

  // Build comprehensive meta tag array
  const tags = [
    // Standard HTML meta tags
    { title: resolvedTitle },
    { name: "description", content: resolvedDescription },
    { name: "keywords", content: resolvedKeywords },

    // Twitter Card meta tags
    { name: "twitter:title", content: resolvedTitle },
    { name: "twitter:description", content: resolvedDescription },
    { name: "twitter:creator", content: metadata.twitter },
    { name: "twitter:site", content: metadata.twitter },

    // Open Graph meta tags
    { name: "og:type", content: "website" },
    { name: "og:title", content: resolvedTitle },
    { name: "og:description", content: resolvedDescription },

    // Conditionally include image-related tags
    ...(image
      ? [
          { name: "twitter:image", content: resolvedImage },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "og:image", content: resolvedImage },
        ]
      : []),
  ];

  return tags;
};
