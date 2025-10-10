import { z } from "zod";

/**
 * Schema for image upload input
 * Accepts base64 encoded image data with metadata
 */
export const brandingUploadImageInputSchema = z.object({
  /** Base64 encoded image data */
  imageData: z.string(),
  /** Image file name */
  fileName: z.string(),
  /** MIME type of the image (e.g., "image/png", "image/jpeg") */
  mimeType: z.string(),
  /** Purpose of the image (for organizing in storage) */
  imageType: z.enum([
    "logo_main",
    "logo_sidebar",
    "logo_favicon",
    "background_light",
    "background_dark",
  ]),
});

export type BrandingUploadImageInput = z.infer<
  typeof brandingUploadImageInputSchema
>;

/**
 * Schema for image upload output
 * Returns the public URL of the uploaded image
 */
export const brandingUploadImageOutputSchema = z.object({
  /** Public URL of the uploaded image */
  url: z.string().url(),
  /** Image type that was uploaded */
  imageType: z.string(),
});

export type BrandingUploadImageOutput = z.infer<
  typeof brandingUploadImageOutputSchema
>;
