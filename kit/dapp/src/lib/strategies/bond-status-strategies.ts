import type { StatsBondStatusOutput } from "@/orpc/routes/token/routes/stats/bond-status.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type {
  BondDisplayData,
  BondProgressData,
  BondStatus,
  BondStatusStrategy,
} from "@/types/bond-status";
import { getUnixTime } from "date-fns";
import { divide, format, from, greaterThan, multiply } from "dnum";
import type { TFunction } from "i18next";

/**
 * Strategy for bonds in the issuing phase
 * Shows progress of bond issuance against the cap
 */
export class IssuingStrategy implements BondStatusStrategy {
  calculateProgress(token: Token): BondProgressData {
    const totalSupply = token.totalSupply;
    const cap = token.capped?.cap || from(0);

    // Use dnum for precise BigInt arithmetic
    const progress = greaterThan(cap, from(0))
      ? Number(format(multiply(divide(totalSupply, cap), from(100))))
      : 0;

    return {
      progress: Math.min(progress, 100), // Cap at 100%
      status: "issuing" as const,
    };
  }

  getDisplayData(
    t: TFunction<readonly ["stats", "tokens"]>,
    progress: number
  ): BondDisplayData {
    return {
      title: t("stats:charts.bondStatus.issuing.title"),
      description: t("stats:charts.bondStatus.issuing.description", {
        percentage: progress.toFixed(1),
      }),
      color: "hsl(var(--chart-1))", // Blue
      label: t("stats:charts.bondStatus.issuing.label"),
    };
  }
}

/**
 * Strategy for bonds in the active phase
 * Shows progress of underlying asset accumulation for redemption
 */
export class ActiveStrategy implements BondStatusStrategy {
  calculateProgress(
    _token: Token,
    bondStatus: StatsBondStatusOutput
  ): BondProgressData {
    // coveredPercentage is already a percentage from the API
    const progress = Number(format(bondStatus.coveredPercentage));

    return {
      progress: Math.min(progress, 100), // Cap at 100%
      status: "active" as const,
    };
  }

  getDisplayData(
    t: TFunction<readonly ["stats", "tokens"]>,
    progress: number
  ): BondDisplayData {
    return {
      title: t("stats:charts.bondStatus.active.title"),
      description: t("stats:charts.bondStatus.active.description", {
        percentage: progress.toFixed(1),
      }),
      color: "hsl(var(--chart-2))", // Green
      label: t("stats:charts.bondStatus.active.label"),
    };
  }
}

/**
 * Strategy for matured bonds
 * Shows progress of bond redemption
 */
export class MaturedStrategy implements BondStatusStrategy {
  calculateProgress(token: Token): BondProgressData {
    const redeemedAmount = token.redeemable?.redeemedAmount || from(0);
    const totalSupply = token.totalSupply;

    // Use dnum for precise BigInt arithmetic
    const progress = greaterThan(totalSupply, from(0))
      ? Number(format(multiply(divide(redeemedAmount, totalSupply), from(100))))
      : 0;

    return {
      progress: Math.min(progress, 100), // Cap at 100%
      status: "matured" as const,
    };
  }

  getDisplayData(
    t: TFunction<readonly ["stats", "tokens"]>,
    progress: number
  ): BondDisplayData {
    return {
      title: t("stats:charts.bondStatus.matured.title"),
      description: t("stats:charts.bondStatus.matured.description", {
        percentage: progress.toFixed(1),
      }),
      color: "hsl(var(--chart-3))", // Orange
      label: t("stats:charts.bondStatus.matured.label"),
    };
  }
}

/**
 * Helper function to get bond status without strategy instantiation
 */
export function getBondStatus(token: Token): BondStatus {
  if (!token.bond) {
    throw new Error("Token is not a bond asset");
  }

  // Check if bond is matured with proper date handling
  const now = getUnixTime(new Date());
  const maturityTimestamp = token.bond.maturityDate
    ? getUnixTime(token.bond.maturityDate)
    : null;
  const isMatured =
    token.bond.isMatured ||
    (maturityTimestamp !== null && now >= maturityTimestamp);

  if (isMatured) {
    return "matured";
  }

  if (token.capped?.cap) {
    const totalSupply = token.totalSupply;
    const cap = token.capped.cap;

    // Use dnum for safe comparison - if total supply is less than cap
    if (greaterThan(cap, totalSupply)) return "issuing";
  }

  return "active";
}

/**
 * Strategy factory to determine which strategy to use based on token state
 */
export function getBondStatusStrategy(token: Token): BondStatusStrategy {
  const status = getBondStatus(token);

  switch (status) {
    case "matured":
      return new MaturedStrategy();
    case "issuing":
      return new IssuingStrategy();
    case "active":
      return new ActiveStrategy();
    default:
      return new ActiveStrategy();
  }
}
