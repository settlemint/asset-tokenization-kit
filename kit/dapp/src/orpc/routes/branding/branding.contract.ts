import { baseContract } from "@/orpc/procedures/base.contract";
import {
  brandingUploadImageInputSchema,
  brandingUploadImageOutputSchema,
} from "./routes/branding.upload-image.schema";
import { brandingInputSchema, brandingOutputSchema } from "./schemas";

/**
 * Contract definition for the branding read endpoint.
 *
 * Retrieves the current branding configuration.
 */
const read = baseContract
  .route({
    method: "GET",
    path: "/branding",
    description: "Get the current platform branding configuration",
    successDescription: "Branding configuration retrieved successfully",
    tags: ["branding"],
  })
  .output(brandingOutputSchema);

/**
 * Contract definition for the branding upsert endpoint.
 *
 * Updates or creates the platform branding configuration.
 */
const upsert = baseContract
  .route({
    method: "POST",
    path: "/branding",
    description: "Update or create platform branding configuration",
    successDescription: "Branding configuration updated successfully",
    tags: ["branding"],
  })
  .input(brandingInputSchema)
  .output(brandingOutputSchema);

/**
 * Contract definition for the branding image upload endpoint.
 *
 * Uploads an image to MinIO for branding purposes.
 */
const uploadImage = baseContract
  .route({
    method: "POST",
    path: "/branding/upload-image",
    description:
      "Upload an image to MinIO for branding (logo, background, etc.)",
    successDescription: "Image uploaded successfully",
    tags: ["branding"],
  })
  .input(brandingUploadImageInputSchema)
  .output(brandingUploadImageOutputSchema);

/**
 * Branding API contract collection.
 *
 * Exports all branding-related API contracts for use in the main contract registry.
 * Provides operations for platform branding customization including logos, colors,
 * and backgrounds.
 *
 * Available endpoints:
 * - read: Get current branding configuration
 * - upsert: Update or create branding configuration
 * - uploadImage: Upload branding images to MinIO
 */
export const brandingContract = {
  read,
  upsert,
  uploadImage,
};
