import { getBondDetail } from "@/lib/queries/bond/bond-detail";

export type BondStatus = "issuing" | "active" | "matured";

// Use the return type of getBondDetail without creating a new interface
type BondDetails = Awaited<ReturnType<typeof getBondDetail>>;

/**
 * Determines the status of a bond based on its properties
 * @param bond The bond object returned from getBondDetail
 * @returns The bond status (issueing, active, or matured)
 */
export function getBondStatus(bond: BondDetails): BondStatus {
  if (bond?.isMatured) {
    return "matured";
  }

  if (bond?.totalSupply !== undefined && bond?.cap !== undefined &&
      Number(bond.totalSupply) < Number(bond.cap)) {
    return "issuing";
  }

  return "active";
}