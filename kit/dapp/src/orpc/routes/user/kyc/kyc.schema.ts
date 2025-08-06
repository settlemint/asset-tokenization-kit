import { residencyStatusEnum } from "@/lib/db/schemas/kyc";
import { z } from "zod";

// Define the residency status enum values as a Zod enum
const residencyStatusValues = residencyStatusEnum.enumValues;
const residencyStatusZod = z.enum(residencyStatusValues);

export const KycProfileSelectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dob: z.date(),
  country: z.string(),
  residencyStatus: residencyStatusZod,
  nationalIdEncrypted: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const KycProfileInsertSchema = z.object({
  id: z.string(),
  userId: z.string(),
  firstName: z.string().min(1).max(64).trim(),
  lastName: z.string().min(1).max(64).trim(),
  dob: z.date().refine((date) => {
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    return date <= eighteenYearsAgo;
  }, "Must be at least 18 years old"),
  country: z
    .string()
    .length(2)
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Must be a valid ISO 3166-1 alpha-2 country code"),
  residencyStatus: residencyStatusZod,
  nationalIdEncrypted: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
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
