import { z } from "zod";

const ALLOWED_CONTENT_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/webp",
] as const;

export const ThemeLogoUploadSchema = z.object({
  mode: z.enum(["light", "dark"]),
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must be at most 255 characters"),
  contentType: z.enum(ALLOWED_CONTENT_TYPES),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, "File size must be 5MB or smaller"),
  previousUrl: z.string().optional(),
});

export const ThemeLogoUploadOutputSchema = z.object({
  mode: z.enum(["light", "dark"]),
  bucket: z.string(),
  objectKey: z.string(),
  publicUrl: z.string(),
  uploadUrl: z.url(),
  method: z.literal("PUT"),
  headers: z.record(z.string(), z.string()).optional(),
  expiresAt: z.string().optional(),
});

export type ThemeLogoUploadInput = z.infer<typeof ThemeLogoUploadSchema>;
export type ThemeLogoUploadOutput = z.infer<typeof ThemeLogoUploadOutputSchema>;
