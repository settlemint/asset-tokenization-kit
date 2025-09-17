import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import { AccountSchema } from "@/orpc/routes/account/routes/account.read.schema";
import { VerificationType } from "@atk/zod/verification-type";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  DEFAULT_PINCODE,
  getUserData,
  registerUserIdentity,
  signInWithUser,
} from "@test/fixtures/user";
import { waitUntil } from "@test/helpers/test-helpers";
import { beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

describe("Identity list (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let issuerClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;
  let targetIdentityAddress: string;

  beforeAll(async () => {
    targetTestUser = await createTestUser("identity-list-target");
    targetUserData = await getUserData(targetTestUser.user);

    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    const issuerHeaders = await signInWithUser(DEFAULT_ISSUER);
    issuerClient = getOrpcClient(issuerHeaders);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    if (!targetUserData.wallet) {
      throw new Error("Target user does not have a wallet address");
    }

    await registerUserIdentity(adminClient, targetUserData.wallet);

    const account = await adminClient.account.read({
      wallet: targetUserData.wallet,
    });

    if (!account?.identity) {
      throw new Error("Identity was not created for target user");
    }

    targetIdentityAddress = account.identity;

    await adminClient.system.identity.claims.issue({
      targetIdentityAddress: account.identity,
      claim: {
        topic: "knowYourCustomer",
        data: {
          claim: "kyc-verified",
        },
      },
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    await issuerClient.system.identity.claims.issue({
      targetIdentityAddress: account.identity,
      claim: {
        topic: "collateral",
        data: {
          amount: "1000000000000000000",
          expiryTimestamp: "1735689600",
        },
      },
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    await waitUntil<z.infer<typeof AccountSchema>>({
      get: () => adminClient.account.read({ wallet: targetUserData.wallet }),
      until: (latestAccount) => (latestAccount?.claims?.length ?? 0) >= 2,
      timeoutMs: 60_000,
      intervalMs: 1000,
    });
  });

  it("returns paginated identity results for identity managers", async () => {
    const result = await adminClient.system.identity.list({
      limit: 25,
      offset: 0,
      orderDirection: "desc",
      orderBy: "createdAt",
    });

    expect(result).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.limit).toBe(25);
    expect(result.offset).toBe(0);

    // Iterate through all results to validate structure
    for (const identity of result.items) {
      expect(identity).toBeDefined();
      expect(typeof identity.id).toBe("string");
      expect(identity.id).toMatch(/^0x[a-fA-F0-9]{40}$/); // Valid Ethereum address
      expect(identity.claimsCount).toBeGreaterThanOrEqual(0);
      expect(identity.activeClaimsCount).toBeGreaterThanOrEqual(0);
      expect(identity.revokedClaimsCount).toBeGreaterThanOrEqual(0);
      expect(identity.activeClaimsCount + identity.revokedClaimsCount).toBe(
        identity.claimsCount
      );
      expect(typeof identity.deployedInTransaction).toBe("string");

      // Validate account/contract relationship
      if (identity.account) {
        expect(identity.contract).toBeNull();
        expect(identity.account.id).toMatch(/^0x[a-fA-F0-9]{40}$/);
      }
      if (identity.contract) {
        expect(identity.account).toBeNull();
        expect(identity.contract.id).toMatch(/^0x[a-fA-F0-9]{40}$/);
        if (identity.contract.contractName) {
          expect(typeof identity.contract.contractName).toBe("string");
        }
      }

      // At least one of account or contract should be present
      expect(identity.account || identity.contract).toBeTruthy();
    }
  });

  it("supports filtering by account address", async () => {
    const filtered = await adminClient.system.identity.list({
      filters: {
        accountId: targetUserData.wallet,
      },
    });

    expect(filtered.total).toBe(filtered.items.length);
    expect(filtered.items.length).toBeGreaterThan(0);

    const [identity] = filtered.items;

    expect(identity).toBeDefined();
    expect(identity!.id.toLowerCase()).toBe(
      targetIdentityAddress.toLowerCase()
    );
    expect(identity!.account?.id.toLowerCase()).toBe(
      targetUserData.wallet?.toLowerCase()
    );
    expect(identity!.contract).toBeNull();
  });

  it("rejects users without identity permissions", async () => {
    await expect(
      investorClient.system.identity.list(
        {
          filters: {
            accountId: targetUserData.wallet,
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.FORBIDDEN],
          },
        }
      )
    ).rejects.toThrow(errorMessageForCode(CUSTOM_ERROR_CODES.FORBIDDEN));
  });
});
