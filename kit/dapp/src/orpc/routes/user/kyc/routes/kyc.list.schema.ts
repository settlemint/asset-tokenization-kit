import { residencyStatusEnum } from "@/lib/db/schemas/kyc";
import { isoCountryCode } from "@atk/zod/iso-country-code";
import { z } from "zod";

const residencyStatusValues = residencyStatusEnum.enumValues;
const residencyStatusZod = z.enum(residencyStatusValues);

export const KycListInputSchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  orderBy: z
    .enum(["createdAt", "updatedAt", "lastName", "firstName"])
    .default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().min(1).optional(),
});

export const KycProfilePublicSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  firstName: z.string().min(1).max(64),
  lastName: z.string().min(1).max(64),
  dob: z.date(),
  country: isoCountryCode,
  residencyStatus: residencyStatusZod,
  nationalId: z.string().min(1).max(50),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const KycListOutputSchema = z.object({
  items: z.array(KycProfilePublicSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type KycListInput = z.infer<typeof KycListInputSchema>;
export type KycListOutput = z.infer<typeof KycListOutputSchema>;
export type KycProfilePublic = z.infer<typeof KycProfilePublicSchema>;
