/**
 * Interface defining the site's configuration
 */
interface SiteConfig {
  /** The name of the site */
  name: string;
  /** The description of the site */
  description: string;
  /** The base URL of the site */
  url: string;
}

/**
 * The main site configuration
 */
export const siteConfig = {
  name: 'Asset Tokenization',
  description: 'SettleMint Asset Tokenization Starter Kit',
  url:
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    'http://localhost:3000',
} as const satisfies SiteConfig;
