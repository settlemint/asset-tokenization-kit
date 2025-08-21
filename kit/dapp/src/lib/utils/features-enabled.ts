/**
 * Asset Feature Detection Utilities
 *
 * @remarks
 * This module provides type-safe feature detection for different asset types in the
 * tokenization platform. It implements business logic that determines which features
 * are available for each asset class, enabling conditional UI rendering and API validation.
 *
 * ARCHITECTURAL PATTERN:
 * - Pure functions for predictable feature detection
 * - Type-safe asset type discrimination using TypeScript
 * - Business rule centralization to prevent feature logic duplication
 * - Future-ready design with placeholder for dynamic feature flags
 *
 * BUSINESS LOGIC MAPPING:
 * - Deposit tokens: Allowlist-based (bank deposits, restricted access)
 * - Fund tokens: Support underlying assets (portfolio composition)
 * - Bond tokens: Support yield and denomination assets (fixed income)
 * - Stablecoin tokens: Support MICA regulation (EU compliance)
 * - All tokens: Support freeze functionality (regulatory compliance)
 *
 * DESIGN DECISIONS:
 * - Static feature detection for performance (no async lookups)
 * - Asset type as single source of truth for feature availability
 * - Explicit boolean returns for clear conditional logic in UI
 * - Extensible pattern for future regulatory and feature additions
 *
 * @see {@link AssetType} Type definitions for supported asset classes
 * @see {@link Address} Ethereum address type for asset identification
 */

import type { AssetType } from "@atk/zod/asset-types";
import type { Address } from "viem";

/**
 * Determines if an asset type supports blocklist functionality for access control.
 *
 * @remarks
 * BUSINESS LOGIC: Most asset types use blocklist patterns (deny specific addresses)
 * except for deposit tokens which require explicit allowlist approval.
 *
 * REGULATORY CONTEXT: Blocklists enable compliance by preventing sanctioned
 * addresses from participating while allowing open access for compliant users.
 *
 * IMPLEMENTATION: Deposit tokens are excluded because they represent bank deposits
 * or similar restricted instruments that require explicit approval rather than
 * open access with exceptions.
 *
 * @param assetType - The asset type to check for blocklist support
 * @returns true if the asset type supports blocklist functionality
 * @example
 * ```typescript
 * // Most asset types support blocklists
 * hasBlocklist("equity"); // true
 * hasBlocklist("bond"); // true
 * hasBlocklist("fund"); // true
 * hasBlocklist("stablecoin"); // true
 *
 * // Deposit tokens use allowlists instead
 * hasBlocklist("deposit"); // false
 *
 * // UI usage
 * {hasBlocklist(assetType) && <BlocklistManagement />}
 * ```
 */
export const hasBlocklist = (assetType: AssetType): boolean =>
  assetType !== "deposit";

/**
 * Determines if an asset type supports allowlist functionality for access control.
 *
 * @remarks
 * BUSINESS LOGIC: Only deposit tokens use allowlist patterns (explicit approval)
 * because they represent restricted instruments like bank deposits or institutional
 * products that require pre-approval for participation.
 *
 * REGULATORY CONTEXT: Allowlists provide stricter control by requiring explicit
 * approval for each participant, suitable for regulated financial products.
 *
 * MUTUAL EXCLUSIVITY: Asset types use either blocklist OR allowlist patterns,
 * not both, to avoid conflicting access control logic.
 *
 * @param assetType - The asset type to check for allowlist support
 * @returns true if the asset type supports allowlist functionality
 * @example
 * ```typescript
 * // Only deposit tokens use allowlists
 * hasAllowlist("deposit"); // true
 *
 * // Other asset types use blocklists
 * hasAllowlist("equity"); // false
 * hasAllowlist("bond"); // false
 *
 * // UI usage
 * {hasAllowlist(assetType) && <AllowlistManagement />}
 * ```
 */
export const hasAllowlist = (assetType: AssetType): boolean =>
  assetType === "deposit";

/**
 * Determines if an asset type supports underlying assets for portfolio composition.
 *
 * @remarks
 * BUSINESS LOGIC: Fund tokens represent portfolios of underlying assets and need
 * to track their composition for NAV calculation, rebalancing, and reporting.
 *
 * FINANCIAL CONTEXT: Funds are investment vehicles that hold multiple underlying
 * securities, requiring detailed composition tracking for regulatory reporting
 * and investor transparency.
 *
 * IMPLEMENTATION: Other asset types represent single instruments and don't need
 * underlying asset tracking (e.g., a bond is a single debt instrument).
 *
 * @param assetType - The asset type to check for underlying asset support
 * @returns true if the asset type supports underlying assets
 * @example
 * ```typescript
 * // Fund tokens track underlying assets
 * hasUnderlyingAssets("fund"); // true
 *
 * // Other asset types are single instruments
 * hasUnderlyingAssets("equity"); // false
 * hasUnderlyingAssets("bond"); // false
 *
 * // UI usage
 * {hasUnderlyingAssets(assetType) && <PortfolioComposition />}
 * ```
 */
export const hasUnderlyingAssets = (assetType: AssetType): boolean =>
  assetType === "fund";

/**
 * Determines if an asset type supports denomination assets for pricing.
 *
 * @remarks
 * BUSINESS LOGIC: Bond tokens need denomination assets to specify the currency
 * or asset in which they pay interest and principal (e.g., USD, EUR, gold).
 *
 * FINANCIAL CONTEXT: Bonds are debt instruments with specific payment currencies.
 * The denomination asset defines what currency the bond pays in, which affects
 * pricing, yield calculations, and settlement.
 *
 * IMPLEMENTATION: Other asset types either have implicit denomination (equity
 * in company shares) or don't need explicit denomination tracking.
 *
 * @param assetType - The asset type to check for denomination asset support
 * @returns true if the asset type supports denomination assets
 * @example
 * ```typescript
 * // Bond tokens need denomination assets
 * hasDenominationAsset("bond"); // true
 *
 * // Other asset types don't need explicit denomination
 * hasDenominationAsset("equity"); // false
 * hasDenominationAsset("fund"); // false
 *
 * // UI usage
 * {hasDenominationAsset(assetType) && <DenominationAssetSelector />}
 * ```
 */
export const hasDenominationAsset = (assetType: AssetType): boolean =>
  assetType === "bond";

/**
 * Determines if an asset type supports yield functionality for income generation.
 *
 * @remarks
 * BUSINESS LOGIC: Bond tokens generate periodic interest payments and need yield
 * scheduling, calculation, and distribution functionality.
 *
 * FINANCIAL CONTEXT: Bonds are fixed-income instruments that pay regular interest
 * (coupons) to holders. This requires complex yield calculation, payment scheduling,
 * and distribution mechanisms.
 *
 * IMPLEMENTATION: Other asset types either don't generate regular income (equity
 * dividends are discretionary) or have different income models (fund distributions).
 *
 * @param assetType - The asset type to check for yield support
 * @returns true if the asset type supports yield functionality
 * @example
 * ```typescript
 * // Bond tokens support yield functionality
 * hasYield("bond"); // true
 *
 * // Other asset types don't have regular yield
 * hasYield("equity"); // false
 * hasYield("fund"); // false
 *
 * // UI usage
 * {hasYield(assetType) && <YieldScheduleManager />}
 * ```
 */
export const hasYield = (assetType: AssetType): boolean => assetType === "bond";

/**
 * Determines if an asset type supports freeze functionality for regulatory compliance.
 *
 * @remarks
 * UNIVERSAL FEATURE: All asset types support freeze functionality because it's
 * a fundamental regulatory compliance tool required across all financial instruments.
 *
 * REGULATORY CONTEXT: Freeze functionality enables immediate suspension of token
 * transfers for specific addresses in response to legal orders, sanctions, or
 * compliance violations.
 *
 * IMPLEMENTATION: The underscore prefix on the parameter indicates it's unused
 * since all asset types support this feature. This maintains consistent function
 * signatures while documenting the universal nature of freeze functionality.
 *
 * @param _assetType - The asset type (unused since all types support freeze)
 * @returns true for all asset types (universal feature)
 * @example
 * ```typescript
 * // All asset types support freeze functionality
 * hasFreeze("equity"); // true
 * hasFreeze("bond"); // true
 * hasFreeze("fund"); // true
 * hasFreeze("deposit"); // true
 * hasFreeze("stablecoin"); // true
 *
 * // UI usage (always shows freeze controls)
 * {hasFreeze(assetType) && <FreezeControls />}
 * ```
 */
export const hasFreeze = (_assetType: AssetType): boolean => true;

/**
 * Determines if MICA regulation is available and enabled for an asset type.
 *
 * @remarks
 * REGULATORY CONTEXT: MICA (Markets in Crypto-Assets) is EU regulation that applies
 * specifically to stablecoins and requires additional compliance, reporting, and
 * operational requirements.
 *
 * IMPLEMENTATION STATUS: Currently returns false for all assets while the
 * infrastructure for feature flags and regulation checking is being developed.
 * The function signature and logic are prepared for future implementation.
 *
 * FUTURE ARCHITECTURE: Will integrate with:
 * - Feature flag system for gradual rollout
 * - Per-asset regulation configuration
 * - Dynamic compliance requirement checking
 *
 * BUSINESS LOGIC: Only stablecoins are subject to MICA regulation, so other
 * asset types will always return false regardless of feature flag status.
 *
 * @param assetType - The asset type to check for MICA regulation support
 * @param _assetAddress - The asset address (unused in current implementation)
 * @returns true if MICA is available and enabled for this asset (currently always false)
 * @example
 * ```typescript
 * // Currently returns false while infrastructure is being built
 * isMicaEnabledForAsset("stablecoin", "0x123..."); // false (TODO)
 * isMicaEnabledForAsset("equity", "0x456..."); // false (not applicable)
 *
 * // Future implementation will check feature flags and asset configuration
 * // isMicaEnabledForAsset("stablecoin", "0x123..."); // true/false based on config
 *
 * // UI usage
 * {isMicaEnabledForAsset(assetType, assetAddress) && <MicaCompliancePanel />}
 * ```
 */
export const isMicaEnabledForAsset = (
  assetType: AssetType,
  _assetAddress: Address
): boolean => {
  // REGULATORY SCOPE: MICA regulation only applies to stablecoins in the EU
  // WHY: Other asset types (equity, bonds, funds) have different regulatory frameworks
  const isAvailable = assetType === "stablecoin";
  if (!isAvailable) {
    return false;
  }

  // TODO: FEATURE FLAG INTEGRATION
  // WHY: Gradual rollout of MICA compliance features across different environments
  // const isFeatureFlagEnabled = await isFeatureEnabled("mica");
  // if (!isFeatureFlagEnabled) {
  //   return false;
  // }

  // TODO: ASSET-SPECIFIC REGULATION CHECK
  // WHY: Individual stablecoins may have different MICA compliance status
  // based on their jurisdiction, issuer, and regulatory approval status
  // return await isRegulationEnabled(assetAddress, "mica");

  // TEMPORARY: Return false until infrastructure is implemented
  // WHY: Prevents UI from showing incomplete MICA features
  return false;
};
