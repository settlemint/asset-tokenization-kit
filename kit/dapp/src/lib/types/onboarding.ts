/**
 * Onboarding Types and Utilities
 *
 * Defines the different onboarding flows and their requirements:
 * - Platform: First admin sets up the platform infrastructure
 * - Issuer: Admins who can issue assets (requires wallet only)
 * - Investor: Users who can invest (requires wallet + identity)
 */

import { type UserRole } from "@/lib/zod/validators/user-roles";

export type OnboardingType = "platform" | "issuer" | "investor";

export interface OnboardingStatus {
  type: OnboardingType;
  isComplete: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export interface PlatformOnboardingRequirements {
  userOnboarded: boolean;
  hasSystem: boolean;
  hasTokenFactories: boolean;
}

export interface IssuerOnboardingRequirements {
  userOnboarded: boolean;
  platformOnboardingComplete: boolean;
}

export interface InvestorOnboardingRequirements {
  userOnboarded: boolean;
  hasIdentity: boolean;
  platformOnboardingComplete: boolean;
}

/**
 * Determines the type of onboarding needed based on platform state and user role
 * @param userRole
 * @param platformRequirements
 */
export function determineOnboardingType(
  userRole: UserRole,
  platformRequirements: PlatformOnboardingRequirements
): OnboardingType {
  // Platform onboarding is needed if user is admin and platform setup is incomplete
  if (
    userRole === "admin" &&
    !isPlatformOnboardingComplete(platformRequirements)
  ) {
    return "platform";
  }

  // Issuer onboarding for issuers
  if (userRole === "issuer") {
    return "issuer";
  }

  // Investor onboarding for investors (users)
  if (userRole === "investor") {
    return "investor";
  }

  // Default to issuer for any other case
  return "issuer";
}

/**
 * Checks if platform onboarding is complete
 * @param requirements
 */
export function isPlatformOnboardingComplete(
  requirements: PlatformOnboardingRequirements
): boolean {
  return (
    requirements.userOnboarded &&
    requirements.hasSystem &&
    requirements.hasTokenFactories
  );
}

/**
 * Checks if issuer onboarding is complete
 * @param requirements
 */
export function isIssuerOnboardingComplete(
  requirements: IssuerOnboardingRequirements
): boolean {
  return requirements.userOnboarded && requirements.platformOnboardingComplete;
}

/**
 * Checks if investor onboarding is complete
 * @param requirements
 */
export function isInvestorOnboardingComplete(
  requirements: InvestorOnboardingRequirements
): boolean {
  return (
    requirements.userOnboarded &&
    requirements.hasIdentity &&
    requirements.platformOnboardingComplete
  );
}

/**
 * Gets the onboarding steps for a given type
 * @param type
 */
export function getOnboardingSteps(type: OnboardingType): string[] {
  switch (type) {
    case "platform":
      return ["wallet", "system", "assets"];
    case "issuer":
      return ["wallet"];
    case "investor":
      return ["wallet", "identity"]; // Identity step to be implemented
  }
}
