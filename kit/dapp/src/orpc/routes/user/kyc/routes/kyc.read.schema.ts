import { residencyStatusEnum } from "@/lib/db/schemas/kyc";
import { isoCountryCode } from "@/lib/zod/validators/iso-country-code";
import { z } from "zod";

const residencyStatusValues = residencyStatusEnum.enumValues;
const residencyStatusZod = z.enum(residencyStatusValues);

export const KycReadInputSchema = z.object({
  userId: z.string().min(1),
});

export const KycReadOutputSchema = z.object({
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

export type KycReadInput = z.infer<typeof KycReadInputSchema>;
export type KycReadOutput = z.infer<typeof KycReadOutputSchema>;
