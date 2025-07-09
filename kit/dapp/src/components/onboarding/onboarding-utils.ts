import type { SessionUser } from "@/lib/auth";
import type { OnboardingType } from "@/lib/types/onboarding";
import { z } from "zod/v4";

// Define the onboarding form schema
export const onboardingSchema = z.object({
  // Wallet Configuration
  walletGenerated: z.boolean().default(false),
  walletAddress: z.string().optional(),
  walletSecured: z.boolean().default(false),

  // System Bootstrap
  systemBootstrapped: z.boolean().default(false),
  systemAddress: z.string().optional(),
  baseCurrency: z.string().default("USD"),

  // Asset Configuration
  selectedAssetTypes: z
    .array(z.enum(["equity", "bond", "deposit", "fund", "stablecoin"]))
    .default([]),
  assetFactoriesDeployed: z.boolean().default(false),

  // Add-ons Configuration
  selectedAddons: z
    .array(z.enum(["airdrops", "xvp", "yield", "governance", "analytics"]))
    .default([]),
  addonsConfigured: z.boolean().default(false),

  // Identity & KYC
  kycCompleted: z.boolean().default(false),
  identityRegistered: z.boolean().default(false),
  // KYC Data
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  residenceCountry: z.string().optional(),
  investorType: z.enum(["retail", "professional", "institutional"]).optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

/**
 * Determines which onboarding types are allowed based on the user role
 */
export function getAllowedOnboardingTypes(
  user: SessionUser | undefined
): OnboardingType[] {
  if (!user) return [];

  switch (user.role) {
    case "platform-owner":
      return ["platformOwner", "assetManager", "investor"];
    case "asset-manager":
      return ["assetManager", "investor"];
    case "investor":
      return ["investor"];
    default:
      return [];
  }
}

/**
 * Determines if wallet steps should be shown
 */
export function shouldShowWalletSteps(
  session: { user?: SessionUser | null } | null | undefined,
  systemAddress?: string | null
): boolean {
  if (!session?.user) return false;
  if (session.user.onboardingComplete) return false;
  return !session.user.wallet && !systemAddress;
}

/**
 * Determines if system setup steps should be shown
 */
export function shouldShowSystemSetupSteps(
  session: { user?: SessionUser | null } | null | undefined,
  systemAddress?: string | null
): boolean {
  if (!session?.user) return false;
  if (session.user.onboardingComplete) return false;
  return session.user.role === "platform-owner" && !systemAddress;
}

/**
 * Determines if identity steps should be shown
 */
export function shouldShowIdentitySteps(
  session: { user?: SessionUser | null } | null | undefined,
  systemAddress?: string | null
): boolean {
  if (!session?.user) return false;
  if (session.user.onboardingComplete) return false;
  return !!systemAddress && !session.user.onchainId;
}
