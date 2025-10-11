import { read } from "./routes/branding.read";
import { uploadImage } from "./routes/branding.upload-image";
import { upsert } from "./routes/branding.upsert";

/**
 * Branding router module.
 *
 * Aggregates all branding-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded branding namespace
 * in the main ORPC router.
 *
 * Current routes:
 * - read: GET /branding - Get current branding configuration
 * - upsert: POST /branding - Update or create branding configuration
 * - uploadImage: POST /branding/upload-image - Upload branding images to MinIO
 *
 * The router provides comprehensive branding management operations with proper
 * authentication and admin-only permission checks on each route.
 */
const routes = {
  read,
  upsert,
  uploadImage,
};

export default routes;
