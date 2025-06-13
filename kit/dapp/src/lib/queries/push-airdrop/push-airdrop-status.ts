export interface CalculatePushAirdropStatusProps {
  distributionCap: string;
  totalDistributed: string;
}

export function calculatePushAirdropStatus({
  distributionCap,
  totalDistributed,
}: {
  distributionCap: string;
  totalDistributed: string;
}) {
  if (
    Number(distributionCap) > 0 &&
    Number(totalDistributed) >= Number(distributionCap)
  ) {
    return "ENDED" as const;
  }

  return "ACTIVE" as const;
}
