import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";

/**
 * Extended frontmatter schema for documentation pages.
 *
 * Provides separation between page titles (used in <h1> and SEO) and
 * navigation titles (used in sidebar and breadcrumbs for brevity).
 */
const frontmatterSchema = z.object({
  /**
   * Full page title displayed in the page header and used for SEO/meta tags.
   * This should be descriptive and optimized for search engines.
   * @example "Business Value & ROI: Complete Cost Analysis"
   */
  title: z.string(),

  /**
   * Short navigation title for sidebar and breadcrumb display.
   * Falls back to `title` if not provided.
   * @example "Business Value"
   */
  navTitle: z.string().optional(),

  /**
   * Meta description for SEO.
   * Used in search engine results and social media previews.
   */
  description: z.string().optional(),

  /**
   * Additional keywords for SEO.
   */
  keywords: z.array(z.string()).optional(),

  /**
   * Open Graph image for social media sharing.
   * Relative path from public directory.
   */
  image: z.string().optional(),
});

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export default defineConfig();
