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
  /** The email of the site */
  email: string;
  /** The publisher of the site */
  publisher: string;
}

const serverEnvironment = getServerEnvironment();

/**
 * The main site configuration
 */
export const siteConfig = {
  publisher: "SettleMint",
  name: "SettleMint Asset Tokenization Kit",
  description: "SettleMint Asset Tokenization Kit",
  url: serverEnvironment.APP_URL,
  email: "no-reply@tokenmint.be",
} as const satisfies SiteConfig;
