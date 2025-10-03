import { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { getAnvilTimeMilliseconds, increaseAnvilTime } from "@/test/anvil";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import { DEFAULT_PINCODE, signInWithUser } from "@test/fixtures/user";
import {
  ADMIN,
  BONDS,
  GERMAN_INVESTOR_1,
  GERMAN_INVESTOR_2,
  ISSUER,
} from "@test/scripts/data";
import { differenceInMilliseconds, isAfter } from "date-fns";

const adminClient = getOrpcClient(await signInWithUser(ADMIN));
const issuerClient = getOrpcClient(await signInWithUser(ISSUER));
const germanInvestor1Client = getOrpcClient(
  await signInWithUser(GERMAN_INVESTOR_1)
);
const germanInvestor2Client = getOrpcClient(
  await signInWithUser(GERMAN_INVESTOR_2)
);

const tokens = await adminClient.token.list({});

const createdBonds = tokens.filter((t) =>
  BONDS.some((b) => b.symbol === t.symbol && b.name === t.name)
);

// Mature the bonds
for (const bond of createdBonds) {
  const bondData = await adminClient.token.read({ tokenAddress: bond.id });
  if (bondData.bond?.isMatured) {
    // Redeem the bond
    await issuerClient.token.redeem({
      contract: bond.id,
      redeemAll: true,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    continue;
  }
  await increaseAnvilTimeToPassMaturityDate(bondData);
  await issuerClient.token.mature({
    contract: bond.id,
    walletVerification: {
      secretVerificationCode: DEFAULT_PINCODE,
      verificationType: "PINCODE",
    },
  });
  if (bondData.yield?.schedule?.id) {
    await germanInvestor1Client.fixedYieldSchedule.claim({
      contract: bondData.yield?.schedule?.id,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    await germanInvestor2Client.fixedYieldSchedule.claim({
      contract: bondData.yield?.schedule?.id,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  }
}

async function increaseAnvilTimeToPassMaturityDate(bond: Token) {
  const currentTime = await getAnvilTimeMilliseconds();
  const maturityDate = bond.bond?.maturityDate;

  if (!maturityDate) {
    throw new Error("Maturity date is undefined");
  }

  const differenceMs = isAfter(maturityDate, currentTime)
    ? differenceInMilliseconds(maturityDate, currentTime)
    : 0;
  const differenceSeconds = Math.ceil(differenceMs / 1000) + 5; // Add 5 seconds to be safe

  if (differenceSeconds > 0) {
    await increaseAnvilTime(differenceSeconds);
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
}
