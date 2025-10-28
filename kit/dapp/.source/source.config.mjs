// source.config.ts
import {
  defineConfig,
  defineDocs,
  frontmatterSchema
} from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      /**
       * Short navigation title for sidebar and breadcrumb display.
       * Falls back to `title` if not provided.
       * @example "Business Value"
       */
      pageTitle: z.string().optional(),
      /**
       * Meta description for SEO.
       * Used in search engine results and social media previews.
       */
      description: z.string().optional(),
      /**
       * Additional keywords for SEO.
       */
      keywords: z.array(z.string()).optional()
    }),
    postprocess: {
      includeProcessedMarkdown: true
    }
  }
});
var source_config_default = defineConfig();
export {
  source_config_default as default,
  docs
};
