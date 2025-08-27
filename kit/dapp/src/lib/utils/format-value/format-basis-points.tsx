import type { BasisPoints } from "@atk/zod/basis-points";
import { FormatPercentage } from "./format-percentage";

export function FormatBasisPoints({
  basisPoints,
}: {
  basisPoints: BasisPoints;
}) {
  const percentage = basisPoints / 100;

  return (
    <FormatPercentage value={percentage} options={{ type: "percentage" }} />
  );
}
