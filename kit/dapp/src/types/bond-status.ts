import type { TFunction } from "i18next";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { StatsBondStatusOutput } from "@/orpc/routes/token/routes/stats/bond-status.schema";
import type { ChartConfig } from "@/components/ui/chart";

/**
 * Bond status enum representing the different lifecycle states
 */
export type BondStatus = "issuing" | "active" | "matured";

/**
 * Raw progress data calculated by strategies
 */
export interface BondProgressData {
  progress: number;
  status: BondStatus;
}

/**
 * Display data for UI rendering
 */
export interface BondDisplayData {
  title: string;
  description: string;
  color: string;
  label: string;
}

/**
 * Footer data for the chart
 */
export interface BondFooterData {
  progress: number;
  label: string;
}

/**
 * Complete chart data ready for rendering
 */
export interface BondChartData {
  data: Array<{
    name: string;
    value: number;
    fill: string;
  }>;
  config: ChartConfig;
  title: string;
  description: string;
  footerData: BondFooterData | null;
  progress: number;
  status: BondStatus;
  isEmpty: boolean;
}

/**
 * Strategy interface for bond status calculations
 */
export interface BondStatusStrategy {
  /**
   * Calculate progress data for this bond state
   */
  calculateProgress(
    token: Token,
    bondStatus: StatsBondStatusOutput
  ): BondProgressData;

  /**
   * Get display data for this bond state
   */
  getDisplayData(
    t: TFunction<readonly ["stats", "tokens"]>,
    progress: number
  ): BondDisplayData;
}
