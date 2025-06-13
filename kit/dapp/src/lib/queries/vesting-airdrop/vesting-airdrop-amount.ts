/**
 * Calculate claimable amount for vesting airdrop
 */
export function calculateClaimableAmount(
  amountExact: bigint,
  claimedAmountExact: bigint,
  vestingDuration: bigint,
  vestingStart: Date
) {
  if (vestingDuration === BigInt(0)) {
    const claimableAmountExact =
      amountExact > claimedAmountExact ? amountExact - claimedAmountExact : 0n;

    return {
      claimableAmountExact,
      lockedAmountExact: 0n,
    };
  }

  const currentTime = new Date();
  const timeElapsed = Math.floor(
    (currentTime.getTime() - vestingStart.getTime()) / 1000
  );

  let vestedAmount = BigInt(0);
  if (BigInt(timeElapsed) >= vestingDuration) {
    vestedAmount = amountExact; // Fully vested
  } else {
    vestedAmount = (amountExact * BigInt(timeElapsed)) / vestingDuration;
  }

  const claimableAmountExact =
    vestedAmount > claimedAmountExact ? vestedAmount - claimedAmountExact : 0n;

  const lockedAmountExact =
    amountExact - claimedAmountExact - claimableAmountExact > 0
      ? amountExact - claimedAmountExact - claimableAmountExact
      : 0n;

  return {
    claimableAmountExact,
    lockedAmountExact,
  };
}

export function calculateAmountOnInitialization(
  cliffDuration: bigint,
  vestingDuration: bigint,
  amountExact: bigint
) {
  if (cliffDuration === BigInt(0) && vestingDuration > BigInt(0)) {
    const initialAmount = amountExact / vestingDuration;
    const claimableAmountExact =
      initialAmount > amountExact ? amountExact : initialAmount;
    const lockedAmountExact = amountExact - claimableAmountExact;

    return {
      claimableAmountExact,
      lockedAmountExact,
    };
  }

  return {
    claimableAmountExact: 0n,
    lockedAmountExact: amountExact,
  };
}
