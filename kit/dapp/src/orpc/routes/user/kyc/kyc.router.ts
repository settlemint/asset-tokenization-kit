import { list } from "./routes/kyc.list";
import { read } from "./routes/kyc.read";
import { upsert } from "./routes/kyc.upsert";
import { remove } from "./routes/kyc.delete";

/**
 * KYC router module.
 *
 * Aggregates all KYC-related route handlers into a single exportable object.
 * This module serves as the entry point for the KYC namespace within the user
 * router, providing CRUD operations for KYC profile management.
 *
 * Features:
 * - Secure storage of sensitive data (national IDs) using AES-256-GCM encryption
 * - Full CRUD operations with proper access control
 * - Email uniqueness validation
 * - Age verification (minimum 18 years)
 * - ISO country code validation
 *
 * Current routes:
 * - list: GET /user/kyc/list - List KYC profiles with pagination and search
 * - read: GET /user/kyc/read - Read a specific KYC profile
 * - upsert: POST /user/kyc/upsert - Create or update a KYC profile (atomic operation)
 * - remove: DELETE /user/kyc/remove - Delete a KYC profile
 *
 * Security considerations:
 * - National IDs are encrypted at rest using env.SETTLEMINT_HASURA_ADMIN_SECRET
 * - Encrypted data is never exposed through the API
 * - All endpoints require authentication and appropriate permissions
 */
const routes = {
  list,
  read,
  upsert,
  remove,
};

export default routes;
