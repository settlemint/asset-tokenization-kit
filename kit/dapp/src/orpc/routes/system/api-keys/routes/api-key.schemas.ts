import { z } from "zod";

export const ApiKeyImpersonationSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().nullable(),
    role: z.string(),
  })
  .nullable();

export const ApiKeyOwnerSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().nullable(),
  })
  .nullable();

export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  prefix: z.string().nullable(),
  start: z.string().nullable(),
  enabled: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  lastUsedAt: z.coerce.date().nullable(),
  description: z.string().nullable(),
  impersonation: ApiKeyImpersonationSchema,
  owner: ApiKeyOwnerSchema,
});

export const ApiKeyWithSecretSchema = ApiKeySchema.extend({
  secret: z.string(),
});

export const ApiKeyCreateInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(256).nullable().optional(),
  impersonateUserId: z.string().nullable().optional(),
  impersonateUserEmail: z.string().email().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});

export const ApiKeyRevokeInputSchema = z.object({
  id: z.string(),
});

export const ApiKeyRevokeResultSchema = z.object({
  success: z.boolean(),
});
