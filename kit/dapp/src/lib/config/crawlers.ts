/**
 * List of common crawler User-Agent patterns organized by category.
 * Used to identify and handle bot traffic appropriately.
 */
export const CRAWLER_USER_AGENTS = [
  // Search Engines
  'Googlebot',
  'Bingbot',
  'Slurp',
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  // Social Media
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'InstagramBot',
  'Pinterest',
  'Mastodon',
  'Bluesky',
  // AI/LLM Crawlers
  'GPTBot',
  'Anthropic-ai',
  'Claude-web',
  'CCBot',
  'Google-Extended',
  // News Aggregators
  'AppleNewsBot',
  'Googlebot-News',
  'FlipboardProxy',
  'NewsNow',
  // SEO Tools
  'AhrefsBot',
  'SemrushBot',
  'rogerbot',
  'MJ12bot',
  // Archive Services
  'archive.org_bot',
  'ia_archiver',
  'archive.today',
  // Preview Generators
  'TelegramBot',
  'SkypeUriPreview',
  'iMessageBot',
  'DiscordBot',
] as const;

/**
 * Type representing all possible crawler user agents
 */
export type CrawlerUserAgent = (typeof CRAWLER_USER_AGENTS)[number];

/**
 * Checks if a given user agent string matches any known crawler patterns
 * @param userAgent - The user agent string to check
 * @returns True if the user agent matches a known crawler pattern
 */
export function isCrawler(userAgent: string): boolean {
  return CRAWLER_USER_AGENTS.some((crawler) => userAgent.toLowerCase().includes(crawler.toLowerCase()));
}
