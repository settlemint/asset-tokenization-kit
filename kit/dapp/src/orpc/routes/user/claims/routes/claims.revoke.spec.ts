import { VerificationType } from "@atk/zod/verification-type";
import { getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_ISSUER,
  signInWithUser,
} from "@test/fixtures/user";
import { beforeAll, describe, expect, it } from "vitest";

describe("Claims revoke (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;
  let issuerClient: ReturnType<typeof getOrpcClient>;
  let adminIdentityAddress: string;

  beforeAll(async () => {
    // Admin user has claimIssuer role and is trusted issuer for ALL claim topics
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    // Investor user should NOT have claimIssuer role
    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    // Issuer user has claimIssuer role but is only trusted for specific topics (not KYC)
    const issuerHeaders = await signInWithUser(DEFAULT_ISSUER);
    issuerClient = getOrpcClient(issuerHeaders);

    // Get admin's identity address for testing
    const adminAccount = await adminClient.account.me({});
    if (!adminAccount?.identity) {
      throw new Error("Admin account does not have an identity setup");
    }
    adminIdentityAddress = adminAccount.identity;
  });

  it("should successfully revoke a collateral claim when user has proper permissions", async () => {
    // First issue a claim to later revoke
    await issuerClient.user.claims.issue({
      targetIdentityAddress: adminIdentityAddress,
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

    // Now revoke the claim
    const result = await issuerClient.user.claims.revoke({
      targetIdentityAddress: adminIdentityAddress,
      claimTopic: "collateral",
      reason: "Collateral has been withdrawn",
      walletVerification: {
        verificationType: VerificationType.pincode,
        secretVerificationCode: "123456",
      },
    });

    expect(result.success).toBe(true);
    expect(result.claimTopic).toBe("collateral");
    expect(result.targetWallet).toBe(adminIdentityAddress);
    expect(result.transactionHash).toBeDefined();
    expect(result.reason).toBe("Collateral has been withdrawn");
  });

  it("should fail when user lacks claimIssuer role", async () => {
    // Investor user should NOT have claimIssuer role
    await expect(
      investorClient.user.claims.revoke({
        targetIdentityAddress: adminIdentityAddress,
        claimTopic: "collateral",
        reason: "Testing unauthorized access",
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
      issuerClient.user.claims.revoke({
        targetIdentityAddress: adminIdentityAddress,
        claimTopic: "knowYourCustomer", // KYC topic that issuer is NOT trusted for
        reason: "Attempting to revoke unauthorized topic",
        walletVerification: {
          verificationType: VerificationType.pincode,
          secretVerificationCode: "123456",
        },
      })
    ).rejects.toThrow("You are not authorized to revoke claims for topic");
  });

  it("should fail with invalid target address format", async () => {
    await expect(
      adminClient.user.claims.revoke({
        targetIdentityAddress: "invalid-address",
        claimTopic: "knowYourCustomer",
        reason: "Testing invalid address",
        walletVerification: {
          verificationType: VerificationType.pincode,
          secretVerificationCode: "123456",
        },
      })
    ).rejects.toThrow();
  });
});
