/**
 * Onboarding Types and Utilities
 *
 * Defines the different onboarding flows and their requirements:
 * - Platform: First admin sets up the platform infrastructure
 * - Issuer: Admins who can issue assets (requires wallet only)
 * - Investor: Users who can invest (requires wallet + identity)
 */

import type { UserRole } from '@/lib/zod/validators/user-roles';

export type OnboardingType = 'platform' | 'issuer' | 'investor';

export interface OnboardingStatus {
  type: OnboardingType;
  isComplete: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export interface PlatformOnboardingRequirements {
  hasWallet: boolean;
  hasSystem: boolean;
  hasTokenFactories: boolean;
}

export interface IssuerOnboardingRequirements {
  hasWallet: boolean;
  platformOnboardingComplete: boolean;
}

export interface InvestorOnboardingRequirements {
  hasWallet: boolean;
  hasIdentity: boolean;
  platformOnboardingComplete: boolean;
}

/**
 * Determines the type of onboarding needed based on platform state and user role
 */
export function determineOnboardingType(
  userRole: UserRole,
  platformRequirements: PlatformOnboardingRequirements
): OnboardingType {
  // Platform onboarding is needed if user is admin and platform setup is incomplete
  if (
    userRole === 'admin' &&
    !isPlatformOnboardingComplete(platformRequirements)
  ) {
    return 'platform';
  }

  // Issuer onboarding for issuers
  if (userRole === 'issuer') {
    return 'issuer';
  }

  // Investor onboarding for investors (users)
  if (userRole === 'investor') {
    return 'investor';
  }

  // Default to issuer for any other case
  return 'issuer';
}

/**
 * Checks if platform onboarding is complete
 */
export function isPlatformOnboardingComplete(
  requirements: PlatformOnboardingRequirements
): boolean {
  return (
    requirements.hasWallet &&
    requirements.hasSystem &&
    requirements.hasTokenFactories
  );
}

/**
 * Checks if issuer onboarding is complete
 */
export function isIssuerOnboardingComplete(
  requirements: IssuerOnboardingRequirements
): boolean {
  return requirements.hasWallet && requirements.platformOnboardingComplete;
}

/**
 * Checks if investor onboarding is complete
 */
export function isInvestorOnboardingComplete(
  requirements: InvestorOnboardingRequirements
): boolean {
  return (
    requirements.hasWallet &&
    requirements.hasIdentity &&
    requirements.platformOnboardingComplete
  );
}

/**
 * Gets the onboarding steps for a given type
 */
export function getOnboardingSteps(type: OnboardingType): string[] {
  switch (type) {
    case 'platform':
      return ['wallet', 'system', 'assets'];
    case 'issuer':
      return ['wallet'];
    case 'investor':
      return ['wallet', 'identity']; // Identity step to be implemented
    default: {
      // This should never happen as TypeScript ensures all cases are covered
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled onboarding type: ${exhaustiveCheck}`);
    }
  }
}
