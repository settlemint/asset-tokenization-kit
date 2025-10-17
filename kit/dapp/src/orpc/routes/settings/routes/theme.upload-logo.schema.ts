import { z } from "zod";

const ALLOWED_CONTENT_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/webp",
] as const;

const BASE64_PATTERN = /^[A-Za-z0-9+/=]+$/;

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
  base64Data: z
    .string()
    .min(1, "File data is required")
    .regex(BASE64_PATTERN, "File data must be base64 encoded"),
  previousUrl: z.string().optional(),
});

export const ThemeLogoUploadOutputSchema = z.object({
  mode: z.enum(["light", "dark"]),
  bucket: z.string(),
  objectKey: z.string(),
  publicUrl: z.string(),
  etag: z.string(),
  updatedAt: z.string(),
});

export type ThemeLogoUploadInput = z.infer<typeof ThemeLogoUploadSchema>;
export type ThemeLogoUploadOutput = z.infer<typeof ThemeLogoUploadOutputSchema>;
