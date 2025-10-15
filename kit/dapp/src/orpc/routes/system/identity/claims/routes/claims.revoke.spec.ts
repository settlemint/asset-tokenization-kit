import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
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
import { waitForGraphIndexing } from "@test/helpers/test-helpers";
import { beforeAll, describe, expect, it } from "vitest";

describe("Claims revoke with MANAGEMENT_KEY authorization (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let issuerClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;
  let targetTestUser: Awaited<ReturnType<typeof createTestUser>>;
  let targetUserData: Awaited<ReturnType<typeof getUserData>>;
  let targetUserClient: ReturnType<typeof getOrpcClient>;
  let targetIdentityAddress: string;

  beforeAll(async () => {
    // Create a unique test user for this test run to ensure determinism
    targetTestUser = await createTestUser("claim-target");
    targetUserData = await getUserData(targetTestUser.user);

    // Admin user - will be used to issue claims
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Issuer user - will NOT have MANAGEMENT_KEY on target identity
    const issuerHeaders = await signInWithUser(DEFAULT_ISSUER);
    issuerClient = getOrpcClient(issuerHeaders);
    const issuerIdentity = await issuerClient.system.identity.me({});
    if (!issuerIdentity?.id) {
      throw new Error("Issuer account does not have an identity setup");
    }

    // Investor user - will NOT have MANAGEMENT_KEY on target identity
    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    // Target user client - WILL have MANAGEMENT_KEY on their own identity
    const targetUserHeaders = await signInWithUser(targetTestUser.user);
    targetUserClient = getOrpcClient(targetUserHeaders);

    // Register identity for the target test user
    if (targetUserData.wallet) {
      await registerUserIdentity(adminClient, targetUserData.wallet);
    } else {
      throw new Error("Target test user does not have a wallet");
    }

    // Get the target user's identity address
    const targetIdentity = await adminClient.system.identity.read({
      wallet: targetUserData.wallet,
    });
    if (!targetIdentity?.id) {
      throw new Error("Target test user does not have an identity setup");
    }
    targetIdentityAddress = targetIdentity.id;
  });

  it("should successfully revoke a claim when user is the identity owner (has MANAGEMENT_KEY)", async () => {
    // First, admin issues a claim to the target user
    const issueResult = await adminClient.system.identity.claims.issue({
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
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    // Check if the issue operation was actually successful
    if (!issueResult.success) {
      throw new Error(
        `Failed to issue claim. Result: ${JSON.stringify(issueResult, null, 2)}`
      );
    }

    // Wait for graph sync before attempting to revoke
    await waitForGraphIndexing();

    // Target user (identity owner) revokes their own claim
    const result = await targetUserClient.system.identity.claims.revoke({
      targetIdentityAddress,
      claimTopic: "collateral",
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    expect(result.success).toBe(true);
    expect(result.claimId).toBeDefined();
    expect(result.transactionHash).toBeDefined();
  });

  it("should fail when user does not have MANAGEMENT_KEY on the target identity", async () => {
    // First, admin issues a claim that we'll try to revoke
    await adminClient.system.identity.claims.issue({
      targetIdentityAddress,
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

    await waitForGraphIndexing();

    // Investor user does NOT have MANAGEMENT_KEY on target identity
    await expect(
      investorClient.system.identity.claims.revoke(
        {
          targetIdentityAddress,
          claimTopic: "knowYourCustomer",
          walletVerification: {
            verificationType: VerificationType.pincode,
            secretVerificationCode: DEFAULT_PINCODE,
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.FORBIDDEN],
          },
        }
      )
    ).rejects.toThrow(
      "You do not have a MANAGEMENT_KEY on this identity. Only users with management rights can revoke claims."
    );
  });

  it("should fail when issuer tries to revoke without MANAGEMENT_KEY (even if they issued the claim)", async () => {
    // Issuer issues a collateral claim
    await issuerClient.system.identity.claims.issue({
      targetIdentityAddress,
      claim: {
        topic: "collateral",
        data: {
          amount: "2000000000000000000",
          expiryTimestamp: "1735689600",
        },
      },
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: DEFAULT_PINCODE,
      },
    });

    await waitForGraphIndexing();

    // Same issuer tries to revoke but doesn't have MANAGEMENT_KEY
    await expect(
      issuerClient.system.identity.claims.revoke(
        {
          targetIdentityAddress,
          claimTopic: "collateral",
          walletVerification: {
            verificationType: VerificationType.pincode,
            secretVerificationCode: DEFAULT_PINCODE,
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.FORBIDDEN],
          },
        }
      )
    ).rejects.toThrow(
      "You do not have a MANAGEMENT_KEY on this identity. Only users with management rights can revoke claims."
    );
  });

  it("should fail gracefully when claim does not exist", async () => {
    // Try to revoke a non-existent claim (even as identity owner)
    await expect(
      targetUserClient.system.identity.claims.revoke(
        {
          targetIdentityAddress,
          claimTopic: "amlKnowYourTransaction", // This claim doesn't exist
          walletVerification: {
            verificationType: VerificationType.pincode,
            secretVerificationCode: DEFAULT_PINCODE,
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.NOT_FOUND],
          },
        }
      )
    ).rejects.toThrow(errorMessageForCode(CUSTOM_ERROR_CODES.NOT_FOUND));
  });
});
