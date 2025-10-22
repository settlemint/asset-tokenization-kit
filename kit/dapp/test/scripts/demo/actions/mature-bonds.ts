import { increaseAnvilTimeForDate } from "@/test/anvil";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import { DEFAULT_PINCODE, signInWithUser } from "@test/fixtures/user";
import { BONDS } from "@test/scripts/demo/data/demo-assets";
import {
  ADMIN,
  GERMAN_INVESTOR_1,
  GERMAN_INVESTOR_2,
  ISSUER,
} from "@test/scripts/demo/data/demo-users";

const adminClient = getOrpcClient(await signInWithUser(ADMIN));
const issuerClient = getOrpcClient(await signInWithUser(ISSUER));
const germanInvestor1Client = getOrpcClient(
  await signInWithUser(GERMAN_INVESTOR_1)
);
const germanInvestor2Client = getOrpcClient(
  await signInWithUser(GERMAN_INVESTOR_2)
);

const tokens = await adminClient.token.list({});

const createdBonds = tokens.tokens.filter((t) =>
  BONDS.some((b) => b.symbol === t.symbol && b.name === t.name)
);

// Mature the bonds
for (const bond of createdBonds) {
  const bondData = await adminClient.token.read({ tokenAddress: bond.id });
  if (bondData.bond?.isMatured) {
    // Redeem the bond
    const totalSupply = bondData.totalSupply?.[0] ?? 0n;
    if (totalSupply > 0n) {
      await issuerClient.token.redeem({
        contract: bond.id,
        amount: totalSupply,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
    }
    continue;
  }
  await increaseAnvilTimeForDate(bondData.bond?.maturityDate);
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
