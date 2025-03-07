import { getServerEnvironment } from "./environment";

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

const serverEnvironment = getServerEnvironment();

/**
 * The main site configuration
 */
export const siteConfig = {
  name: "Asset Tokenization",
  description: "SettleMint Asset Tokenization Kit",
  url: serverEnvironment.APP_URL,
} as const satisfies SiteConfig;
