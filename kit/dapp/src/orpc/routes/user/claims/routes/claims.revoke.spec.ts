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
import { waitForGraphSync } from "@test/helpers/test-helpers";
import { beforeAll, describe, expect, it } from "vitest";

describe("Claims revoke (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let issuerClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;
  let targetIdentityAddress: string;

  beforeAll(async () => {
    // Create a unique test user for this test run to ensure determinism
    targetTestUser = await createTestUser("claim-target");
    targetUserData = await getUserData(targetTestUser.user);

    // Admin user has claimIssuer role and is trusted issuer for ALL claim topics
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Issuer user has claimIssuer role but is only trusted for specific topics (not KYC)
    const issuerHeaders = await signInWithUser(DEFAULT_ISSUER);
    issuerClient = getOrpcClient(issuerHeaders);
    const issuerAccount = await issuerClient.account.me({});
    if (!issuerAccount?.identity) {
      throw new Error("Issuer account does not have an identity setup");
    }

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    // Register identity for the target test user
    if (targetUserData.wallet) {
      await registerUserIdentity(adminClient, targetUserData.wallet);
    } else {
      throw new Error("Target test user does not have a wallet");
    }

    // Wait for graph sync to ensure identity is indexed
    await waitForGraphSync();

    // Get the target user's identity address
    const targetAccount = await adminClient.account.read({
      wallet: targetUserData.wallet,
    });
    if (!targetAccount?.identity) {
      throw new Error("Target test user does not have an identity setup");
    }
    targetIdentityAddress = targetAccount.identity;
  });

  it("should successfully revoke a collateral claim when user has proper permissions", async () => {
    // First issue a claim to later revoke
    const issueResult = await issuerClient.user.claims.issue({
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

    // Check if the issue operation was actually successful
    if (!issueResult.success) {
      throw new Error(
        `Failed to issue claim. Result: ${JSON.stringify(issueResult, null, 2)}`
      );
    }

    // Wait for graph sync before attempting to revoke
    await waitForGraphSync();

    // Now revoke the claim by topic
    const result = await issuerClient.user.claims.revoke({
      targetIdentityAddress,
      claimTopic: "collateral",
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: "123456",
      },
    });

    expect(result.success).toBe(true);
    expect(result.claimId).toBeDefined();
    expect(result.transactionHash).toBeDefined();
  });

  it("should fail when user lacks claimIssuer role", async () => {
    // Investor user should NOT have claimIssuer role
    await expect(
      investorClient.user.claims.revoke({
        targetIdentityAddress,
        claimTopic: "collateral",
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
    // Admin issues a KYC claim first so that it exists on-chain
    await adminClient.user.claims.issue({
      targetIdentityAddress,
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

    // Issuer (not trusted for KYC) attempts to revoke
    await expect(
      issuerClient.user.claims.revoke({
        targetIdentityAddress,
        claimTopic: "knowYourCustomer",
        walletVerification: {
          verificationType: VerificationType.pincode,
          secretVerificationCode: "123456",
        },
      })
    ).rejects.toThrow("You are not authorized to revoke claims for topic");
  });
});
