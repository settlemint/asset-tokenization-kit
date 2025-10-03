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
    const issuerIdentity = await issuerClient.system.identity.me({});
    if (!issuerIdentity?.id) {
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

    // Get the target user's identity address
    const targetIdentity = await adminClient.system.identity.read({
      wallet: targetUserData.wallet,
    });
    if (!targetIdentity?.id) {
      throw new Error("Target test user does not have an identity setup");
    }
    targetIdentityAddress = targetIdentity.id;
  });

  it("should successfully revoke a collateral claim when user has proper permissions", async () => {
    // First issue a claim to later revoke
    const issueResult = await issuerClient.system.identity.claims.issue({
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

    // Now revoke the claim by topic
    const result = await issuerClient.system.identity.claims.revoke({
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

  it("should fail when user lacks claimIssuer role", async () => {
    // Investor user should NOT have claimIssuer role
    await expect(
      investorClient.system.identity.claims.revoke(
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
            skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  });

  it("should fail when user has claimIssuer role but is not a trusted issuer for the claim topic", async () => {
    // Admin issues a KYC claim first so that it exists on-chain
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

    // Issuer (not trusted for KYC) attempts to revoke
    await expect(
      issuerClient.system.identity.claims.revoke(
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
      "You are not a trusted issuer for topic(s): knowYourCustomer"
    );
  });
});
