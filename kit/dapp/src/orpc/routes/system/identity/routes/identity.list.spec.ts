import { VerificationType } from "@atk/zod/verification-type";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  createTestUser,
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  getUserData,
  registerUserIdentity,
  signInWithUser,
} from "@test/fixtures/user";
import { waitUntil } from "@test/helpers/test-helpers";
import { beforeAll, describe, expect, it } from "vitest";

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

    await waitUntil({
      get: () => adminClient.account.read({ wallet: targetUserData.wallet }),
      until: (account) => Boolean(account?.identity),
      timeoutMs: 60_000,
      intervalMs: 1000,
    });

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
        secretVerificationCode: "123456",
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
        secretVerificationCode: "123456",
      },
    });

    await waitUntil({
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

    const [firstIdentity] = result.items;
    expect(firstIdentity).toBeDefined();
    if (!firstIdentity) {
      return;
    }

    expect(typeof firstIdentity.id).toBe("string");
    expect(firstIdentity.claimsCount).toBeGreaterThanOrEqual(0);
    expect(firstIdentity.activeClaimsCount).toBeGreaterThanOrEqual(0);
    expect(firstIdentity.revokedClaimsCount).toBeGreaterThanOrEqual(0);
    expect(typeof firstIdentity.deployedInTransaction).toBe("string");
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
      investorClient.system.identity.list({
        filters: {
          accountId: targetUserData.wallet,
        },
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action"
    );
  });
});
