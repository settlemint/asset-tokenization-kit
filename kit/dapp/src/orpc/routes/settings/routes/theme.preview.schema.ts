import { z } from "zod";
import {
  themeConfigPartialSchema,
  themeConfigSchema,
} from "@/components/theme/schema";

export const ThemePreviewSchema = z.object({
  diff: themeConfigPartialSchema.optional(),
  ttlSeconds: z.number().int().min(1).max(300).optional(),
  baseVersion: z.number().int().gte(1),
});

export const ThemePreviewOutputSchema = z.object({
  theme: themeConfigSchema,
  expiresAt: z.number().int(),
});
