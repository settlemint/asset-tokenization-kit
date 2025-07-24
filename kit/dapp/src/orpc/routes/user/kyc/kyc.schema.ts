import { kycProfiles } from "@/lib/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const KycProfileSelectSchema = createSelectSchema(kycProfiles);
export const KycProfileInsertSchema = createInsertSchema(kycProfiles, {
  firstName: (schema) => schema.min(1).max(64).trim(),
  lastName: (schema) => schema.min(1).max(64).trim(),
  dob: (schema) =>
    schema.max(
      new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000),
      "Must be at least 18 years old"
    ),
  residencyStatus: (schema) => schema,
});

export const KycProfileUpsertSchema = KycProfileInsertSchema.omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  nationalIdEncrypted: true,
})
  .extend({
    id: z.string().optional(),
    nationalId: z.string().min(1).max(50).optional(),
  })
  .refine(
    (data) => {
      // For new records (no id), nationalId is required
      if (!data.id) {
        return !!data.nationalId;
      }
      // For updates (id provided), nationalId is optional
      return true;
    },
    {
      message: "National ID is required when creating a new KYC profile",
    }
  );

export const KycProfileListSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  orderBy: z
    .enum(["createdAt", "updatedAt", "lastName", "firstName"])
    .default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export const UserIdSchema = z.object({
  userId: z.string(),
});

export const KycProfileIdSchema = UserIdSchema.extend({
  id: z.string(),
});

export const KycProfilePublicSchema = KycProfileSelectSchema.omit({
  nationalIdEncrypted: true,
}).extend({
  hasNationalId: z.boolean(),
});

export const KycProfileListOutputSchema = z.object({
  items: z.array(KycProfilePublicSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type KycProfile = z.infer<typeof KycProfileSelectSchema>;
export type KycProfileUpsert = z.infer<typeof KycProfileUpsertSchema>;
export type KycProfileListInput = z.infer<typeof KycProfileListSchema>;
export type KycProfileListOutput = z.infer<typeof KycProfileListOutputSchema>;
