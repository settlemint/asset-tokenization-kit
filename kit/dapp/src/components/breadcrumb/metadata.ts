import type { AssetClass } from "@/lib/zod/validators/asset-types";
import type { CustomTypeOptions } from "i18next";

/**
 * Breadcrumb metadata that can be attached to routes
 */
export interface BreadcrumbMetadata {
  /** The display title for the breadcrumb (can be an i18n key) */
  title: string;
  /** Whether this is an i18n key that needs translation */
  isI18nKey?: boolean;
  /** Optional i18n namespace (defaults to "navigation") */
  i18nNamespace?: keyof CustomTypeOptions["resources"];
  /** Optional function to dynamically resolve the title */
  getTitle?: () => string | Promise<string>;
  /** Whether this segment should be hidden from breadcrumbs */
  hidden?: boolean;
  /** Optional icon identifier */
  icon?: string;
  /** Optional href for navigation */
  href?: string;
}

/**
 * Type guard to check if a breadcrumb has an i18n key
 */
export function isI18nBreadcrumb(
  metadata: BreadcrumbMetadata
): metadata is BreadcrumbMetadata & { isI18nKey: true } {
  return metadata.isI18nKey === true;
}

/**
 * Extended route context with breadcrumb metadata
 */
export interface RouteContextWithBreadcrumb {
  breadcrumb?: BreadcrumbMetadata;
}

/**
 * Asset class breadcrumb metadata mapping with i18n support
 */
export const assetClassBreadcrumbs: Record<
  AssetClass | "asset-management",
  BreadcrumbMetadata
> = {
  "asset-management": {
    title: "assetManagement",
    isI18nKey: true,
  },
  fixedIncome: {
    title: "fixedIncome",
    isI18nKey: true,
  },
  flexibleIncome: {
    title: "flexibleIncome",
    isI18nKey: true,
  },
  cashEquivalent: {
    title: "cashEquivalent",
    isI18nKey: true,
  },
} as const;

/**
 * Helper to build breadcrumb metadata for routes
 */
export function createBreadcrumbMetadata(
  title: string,
  options?: Partial<BreadcrumbMetadata>
): BreadcrumbMetadata {
  return {
    title,
    ...options,
  };
}

/**
 * Helper to build i18n-enabled breadcrumb metadata
 */
export function createI18nBreadcrumbMetadata(
  i18nKey: string,
  options?: Partial<BreadcrumbMetadata>
): BreadcrumbMetadata {
  return {
    title: i18nKey,
    isI18nKey: true,
    i18nNamespace: "navigation",
    ...options,
  };
}
