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
import { waitForGraphIndexing } from "@test/helpers/test-helpers";
import { beforeAll, describe, expect, it } from "vitest";

describe("Claims issue (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let issuerClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;
  let targetIdentityAddress: string;

  beforeAll(async () => {
    // Create a unique test user for this test run to ensure determinism
    targetTestUser = await createTestUser("claim-list-target");
    targetUserData = await getUserData(targetTestUser.user);

    // Admin user has claimIssuer role and is trusted issuer for ALL claim topics
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Investor user should NOT have claimIssuer role
    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    // Issuer user has claimIssuer role but is only trusted for specific topics (not KYC)
    const issuerHeaders = await signInWithUser(DEFAULT_ISSUER);
    issuerClient = getOrpcClient(issuerHeaders);

    // Register identity for the target test user
    if (targetUserData.wallet) {
      await registerUserIdentity(adminClient, targetUserData.wallet);
    } else {
      throw new Error("Target test user does not have a wallet");
    }

    // Wait for graph sync to ensure identity is indexed
    await waitForGraphIndexing();

    // Get the target user's identity address
    const targetAccount = await adminClient.account.read({
      wallet: targetUserData.wallet,
    });
    if (!targetAccount?.identity) {
      throw new Error("Target test user does not have an identity setup");
    }
    targetIdentityAddress = targetAccount.identity;
  });

  it("should successfully issue a collateral claim when user has proper permissions", async () => {
    // Issuer is trusted issuer for asset-related topics
    const result = await issuerClient.system.identity.claims.issue({
      targetIdentityAddress,
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

    expect(result.success).toBe(true);
    expect(result.claimTopic).toBe("collateral");
    expect(result.targetWallet).toBe(targetIdentityAddress);
    // Transaction hash should be returned from the helper
    expect(result.transactionHash).toBeDefined();
    expect(typeof result.transactionHash).toBe("string");
  });

  it("should fail when user lacks claimIssuer role", async () => {
    // Investor user should NOT have claimIssuer role
    await expect(
      investorClient.system.identity.claims.issue({
        targetIdentityAddress,
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
      })
    ).rejects.toThrow(
      "User does not have the required role to execute this action"
    );
  });

  it("should fail when user has claimIssuer role but is not a trusted issuer for the claim topic", async () => {
    // Issuer has claimIssuer role but is only trusted issuer for asset-related topics (not KYC)
    await expect(
      issuerClient.system.identity.claims.issue({
        targetIdentityAddress,
        claim: {
          topic: "knowYourCustomer", // KYC topic that issuer is NOT trusted for
          data: {
            claim: "verified",
          },
        },
        walletVerification: {
          verificationType: VerificationType.pincode,
          secretVerificationCode: "123456",
        },
      })
    ).rejects.toThrow(
      "You are not a trusted issuer for topic: knowYourCustomer"
    );
  });

  it("should fail with invalid target address format", async () => {
    await expect(
      adminClient.system.identity.claims.issue({
        targetIdentityAddress: "invalid-address",
        claim: {
          topic: "knowYourCustomer",
          data: {
            claim: "verified",
          },
        },
        walletVerification: {
          verificationType: VerificationType.pincode,
          secretVerificationCode: "123456",
        },
      })
    ).rejects.toThrow();
  });
});
