import { IdentitySchema } from "@/orpc/routes/system/identity/routes/identity.read.schema";

/**
 * Output schema for identity.me operations
 * Reuses the same schema as identity.read since it returns the same data structure
 */
export const IdentityMeSchema = IdentitySchema;

/**
 * Type definition
 */
export type IdentityMe = typeof IdentityMeSchema;