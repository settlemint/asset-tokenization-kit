import { isoCountryCode } from "@atk/zod/iso-country-code";
import { residencyStatus } from "@atk/zod/residency-status";
import { z } from "zod";

// Strict field definitions shared between input and output
const strictFirstName = z.string().min(1).max(64).trim();
const strictLastName = z.string().min(1).max(64).trim();
const strictDob = z.date().refine((date) => {
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
  return date <= eighteenYearsAgo;
}, "Must be at least 18 years old");
const strictNationalId = z.string().min(1).max(50).trim();

// Optional field definitions for when fields are not required
const optionalFirstName = strictFirstName.optional();
const optionalLastName = strictLastName.optional();
const optionalDob = strictDob.optional();
const optionalCountry = isoCountryCode.optional();
const optionalResidencyStatus = residencyStatus().optional();
const optionalNationalId = strictNationalId.optional();

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
  userId: z.string().min(1),
  id: z.string().min(1).optional(),
  firstName: optionalFirstName,
  lastName: optionalLastName,
  dob: optionalDob,
  country: optionalCountry,
  residencyStatus: optionalResidencyStatus,
  nationalId: optionalNationalId,
});

export const KycUpsertOutputSchema = z.object({
  userId: z.string().min(1),
  id: z.string().min(1),
  firstName: optionalFirstName,
  lastName: optionalLastName,
  dob: optionalDob,
  country: optionalCountry,
  residencyStatus: optionalResidencyStatus,
  nationalId: optionalNationalId,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type KycUpsertInput = z.infer<typeof KycUpsertInputSchema>;
export type KycUpsertOutput = z.infer<typeof KycUpsertOutputSchema>;
