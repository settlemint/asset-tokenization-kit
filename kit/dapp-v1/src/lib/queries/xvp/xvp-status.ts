import { isBefore } from "date-fns";
import type { XvPSettlement, XvPStatus } from "./xvp-schema";
/**
 * Calculates the status of an XvP settlement based on execution, cancellation, expiration, and approvals
 *
 * @param settlement - The raw settlement data from The Graph
 * @returns The calculated XvP status
 */
export function calculateXvPStatus(settlement: XvPSettlement): XvPStatus {
  if (settlement.executed) {
    return "EXECUTED";
  }

  if (settlement.cancelled) {
    return "CANCELLED";
  }

  const isExpired = isBefore(settlement.cutoffDate, new Date());
  if (isExpired) {
    return "EXPIRED";
  }

  // Ensure flows is an array, default to empty if not present
  const flows = Array.isArray(settlement.flows) ? settlement.flows : [];

  const approvalsRequiredCount = flows.length;
  const actualApprovalsCount = settlement.approvals.filter(
    (approval) => approval.approved
  ).length;

  if (
    approvalsRequiredCount > 0 &&
    actualApprovalsCount === approvalsRequiredCount
  ) {
    return "READY";
  }

  return "PENDING";
}
