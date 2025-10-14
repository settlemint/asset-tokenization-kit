import { isoCountryCode } from "@atk/zod/iso-country-code";
import { residencyStatus } from "@atk/zod/residency-status";
import * as z from "zod";

// Strict field definitions shared between input and output
const strictFirstName = z.string().min(1).max(64).trim();
const strictLastName = z.string().min(1).max(64).trim();
const strictDob = z.date().refine((date) => {
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  return date <= eighteenYearsAgo;
}, "Must be at least 18 years old");
const strictNationalId = z.string().min(1).max(50).trim();

// Base schema with all strict validations
const KycBaseSchema = {
  userId: z.string().min(1),
  firstName: strictFirstName,
  lastName: strictLastName,
  dob: strictDob,
  country: isoCountryCode,
  residencyStatus: residencyStatus(),
};

export const KycUpsertInputSchema = z.object({
  ...KycBaseSchema,
  id: z.string().min(1).optional(),
  nationalId: strictNationalId,
});

export const KycUpsertOutputSchema = z.object({
  ...KycBaseSchema,
  id: z.string().min(1),
  nationalId: strictNationalId,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KycUpsertInput = z.infer<typeof KycUpsertInputSchema>;
export type KycUpsertOutput = z.infer<typeof KycUpsertOutputSchema>;
