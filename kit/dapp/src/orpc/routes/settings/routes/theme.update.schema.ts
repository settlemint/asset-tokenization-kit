import { z } from "zod";
import {
  themeConfigSchema,
  type ThemeConfig,
} from "@/components/theme/lib/schema";

/**
 * Schema for theme update request - accepts full theme configuration
 */
export const ThemeUpdateSchema: z.ZodType<ThemeConfig> = themeConfigSchema;

/**
 * Schema for theme update response
 */
export const ThemeUpdateOutputSchema = z.object({
  theme: themeConfigSchema,
  success: z.boolean(),
});
