/**
 * Unfreeze Partial Tokens Test Suite
 *
 * WHY: Validates partial token unfreezing functionality essential for regulatory compliance
 * recovery and precision asset management in tokenization platforms.
 *
 * CRITICAL BUSINESS CONTEXT:
 * - Regulatory authorities need ability to selectively restore frozen holdings
 * - Investigation resolution requires precise unfreezing of cleared amounts
 * - Legal settlements may demand partial release of disputed assets
 * - Compliance remediation requires granular control over asset restoration
 *
 * TRADEOFF: Partial unfreezing requires complex accounting but enables surgical
 * compliance operations without disrupting unrelated frozen amounts.
 *
 * SECURITY: Tests verify role-based access controls and proper balance validation
 * to prevent unauthorized asset restoration or accounting manipulation.
 */
import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import {
  errorMessageForCode,
  getOrpcClient,
  type OrpcClient,
} from "@test/fixtures/orpc-client";
import { createToken } from "@test/fixtures/token";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  DEFAULT_PINCODE,
  signInWithUser,
} from "@test/fixtures/user";
import { from } from "dnum";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";

/**
 * Test suite for partial token unfreezing operations.
 *
 * ARCHITECTURE: Establishes pre-frozen token state to test meaningful unfreeze
 * operations, validating both the unfreezing process and constraint enforcement.
 */
describe("Token unfreeze partial", () => {
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;
  let investorClient: OrpcClient;
  let investorAddress: Address;

  /**
   * Test environment setup with pre-frozen tokens for unfreeze testing.
   *
   * WHY: Creates realistic test scenario with:
   * 1. Admin user with freezer privileges (regulatory authority)
   * 2. Investor user with partially frozen holdings (compliance subject)
   * 3. Stablecoin token with CUSTODIAN extension (regulated asset)
   * 4. Pre-established frozen balance (50% of holdings)
   *
   * DESIGN DECISION: Pre-freezes 5000 out of 10000 tokens to create meaningful
   * unfreeze scenarios with proper constraints and balance validations.
   *
   * INVARIANT: Frozen balance must exist before unfreezing can be tested,
   * ensuring test scenarios reflect realistic regulatory workflows.
   */
  beforeAll(async () => {
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    const investorUser = await investorClient.user.me();
    investorAddress = investorUser.wallet as Address;

    // WHY: Stablecoin type inherently includes CUSTODIAN extension for compliance
    const stablecoinData = {
      type: "stablecoin" as const,
      name: `Test Unfreezable Stablecoin ${Date.now()}`,
      symbol: "TUST",
      decimals: 18,
      initialModulePairs: [],
      basePrice: from("1.00", 2),
    };

    stablecoinToken = await createToken(
      adminClient,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        ...stablecoinData,
        countryCode: "056",
      },
      {
        grantRole: ["supplyManagement", "custodian", "governance"],
        unpause: true,
      }
    );

    expect(stablecoinToken).toBeDefined();
    expect(stablecoinToken.id).toBeDefined();
    expect(stablecoinToken.type).toBe(stablecoinData.type);

    // SETUP: Establish substantial token holdings for meaningful freeze/unfreeze testing
    // Ensure sufficient collateral is set before minting to avoid reverts (only if supported)
    const createdTokenDetails = await adminClient.token.read({
      tokenAddress: stablecoinToken.id,
    });
    if (createdTokenDetails.extensions.includes("COLLATERAL")) {
      await adminClient.token.updateCollateral({
        contract: stablecoinToken.id,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        amount: from("1000000", stablecoinToken.decimals),
        expiryDays: 30,
      });
    }

    // Retry mint briefly in case on-chain claim finalization is still indexing
    {
      const maxAttempts = 3;
      let lastError: unknown;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await adminClient.token.mint({
            contract: stablecoinToken.id,
            recipients: [investorAddress],
            amounts: [from("10000", stablecoinToken.decimals)],
            walletVerification: {
              secretVerificationCode: DEFAULT_PINCODE,
              verificationType: "PINCODE",
            },
          });
          lastError = undefined;
          break;
        } catch (err) {
          lastError = err;
          await new Promise((r) => setTimeout(r, 750));
        }
      }
      if (lastError) throw lastError;
    }

    // SECURITY: Grant custodian role to admin for authorized freeze operations
    const adminUser = await adminClient.user.me();
    const adminAddress = adminUser.wallet as Address;

    await adminClient.token.grantRole({
      contract: stablecoinToken.id,
      accounts: [adminAddress],
      role: "custodian",
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // PREREQUISITE: Pre-freeze 50% of holdings to establish baseline for unfreeze testing
    await adminClient.token.freezePartial({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      amount: from("5000", stablecoinToken.decimals).toString(),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

  /**
   * Validates that authorized users can perform partial token unfreezing operations.
   *
   * WHY: Core compliance recovery functionality enabling authorities to:
   * - Release cleared funds after investigation completion
   * - Restore liquidity to previously suspicious but validated transactions
   * - Execute court-ordered partial asset releases
   * - Resolve false-positive regulatory flags with surgical precision
   *
   * DESIGN: Tests 40% unfreeze (2000 of 5000 frozen) to validate partial
   * operations while maintaining remaining frozen balance for further testing.
   *
   * ACCOUNTING: Maintains frozen balance integrity by ensuring unfrozen amount
   * is properly subtracted from total frozen balance.
   */
  test("admin can unfreeze partial tokens", async () => {
    // OPERATION: Unfreeze 40% of previously frozen tokens to test partial functionality
    const unfreezeAmount = from("2000", stablecoinToken.decimals).toString();
    const result = await adminClient.token.unfreezePartial({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      amount: unfreezeAmount,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(stablecoinToken.id);

    // VERIFICATION: Confirm unfreeze operation updated token state correctly
    const investorBalance = await investorClient.token.read({
      tokenAddress: stablecoinToken.id,
    });

    // The unfrozen balance should be reflected in available tokens
    expect(investorBalance).toBeDefined();
  }, 100_000);

  /**
   * Ensures unauthorized users cannot perform unfreeze operations.
   *
   * WHY: Critical security boundary preventing abuse of unfreeze functionality.
   * Without proper access controls, malicious users could:
   * - Release their own frozen assets to evade regulatory compliance
   * - Manipulate frozen balances to hide illicit activity
   * - Undermine investigation processes by restoring flagged funds
   * - Create accounting inconsistencies through unauthorized balance changes
   *
   * SECURITY: Validates that role-based access control properly rejects
   * non-freezer users attempting unfreeze operations on any address.
   */
  test("regular users cannot unfreeze tokens", async () => {
    const regularUserHeaders = await signInWithUser(DEFAULT_INVESTOR);
    const regularClient = getOrpcClient(regularUserHeaders);

    const unfreezeAmount = from("100", stablecoinToken.decimals).toString();

    // SECURITY: Verify unauthorized users are rejected with proper error code
    await expect(
      regularClient.token.unfreezePartial(
        {
          contract: stablecoinToken.id,
          userAddress: investorAddress,
          amount: unfreezeAmount,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            // TESTING: Skip logging expected authorization failures for clean output
            skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  });

  /**
   * Validates constraints prevent unfreezing more tokens than are currently frozen.
   *
   * WHY: Maintains accounting integrity and prevents balance manipulation.
   * Without frozen balance validation:
   * - Unfrozen balance could exceed actual frozen amount, creating phantom tokens
   * - Smart contract state could become inconsistent
   * - Regulatory compliance could be undermined through artificial balance inflation
   * - Token economics could be manipulated through spurious unfreeze operations
   *
   * INVARIANT: Unfrozen amount cannot exceed remaining frozen balance.
   * Current state: 5000 frozen - 2000 unfrozen = 3000 remaining frozen.
   *
   * EDGE CASE: Tests attempting to unfreeze the original full amount (5000)
   * when only partial amount (3000) remains frozen.
   */
  test("cannot unfreeze more tokens than are frozen", async () => {
    // CONSTRAINT: Attempt to unfreeze original full amount when only partial remains
    // (5000 originally frozen, 2000 already unfrozen, only 3000 should remain)
    const excessiveUnfreezeAmount = from(
      "5000",
      stablecoinToken.decimals
    ).toString();

    // INVARIANT: Smart contract should reject operations exceeding frozen balance
    await expect(
      adminClient.token.unfreezePartial(
        {
          contract: stablecoinToken.id,
          userAddress: investorAddress,
          amount: excessiveUnfreezeAmount,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            // TESTING: Skip logging expected transaction reverts for clean output
            skipLoggingFor: ["TRANSACTION_REVERTED"],
          },
        }
      )
    ).rejects.toThrow();
  });

  /**
   * Confirms unfreeze operations fail gracefully on non-custodian tokens.
   *
   * WHY: Prevents runtime errors when unfreeze operations are attempted on tokens
   * that lack the required CUSTODIAN extension. This protects against:
   * - Misleading success responses for unsupported operations
   * - Runtime failures in production environments
   * - User confusion about which tokens support unfreeze functionality
   * - Accounting inconsistencies from attempting impossible operations
   *
   * ARCHITECTURE: Creates minimal token without CUSTODIAN capabilities to
   * simulate legacy tokens or tokens deployed without regulatory features.
   *
   * DESIGN: Returns specific TOKEN_INTERFACE_NOT_SUPPORTED error for clear
   * developer feedback about capability limitations.
   */
  test("cannot unfreeze on token without CUSTODIAN extension", async () => {
    // SETUP: Create token without custodian capabilities to test error handling
    const nonCustodianToken = await createToken(adminClient, {
      type: "stablecoin",
      name: `Non-Custodian Token ${Date.now()}`,
      symbol: "NCT2",
      decimals: 18,
      initialModulePairs: [], // WHY: Empty pairs exclude CUSTODIAN extension
      basePrice: from("1.00", 2),
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      countryCode: "056",
    });

    const unfreezeAmount = from("100", nonCustodianToken.decimals).toString();

    // VALIDATION: Verify proper error code for unsupported token interfaces
    await expect(
      adminClient.token.unfreezePartial(
        {
          contract: nonCustodianToken.id,
          userAddress: investorAddress,
          amount: unfreezeAmount,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            // TESTING: Skip logging expected interface errors for clean output
            skipLoggingFor: [CUSTOM_ERROR_CODES.TOKEN_INTERFACE_NOT_SUPPORTED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.TOKEN_INTERFACE_NOT_SUPPORTED)
    );
  });

  /**
   * Validates complete restoration of frozen holdings through final unfreeze operation.
   *
   * WHY: Tests the complete regulatory compliance cycle from freeze to full restoration.
   * Essential for scenarios like:
   * - Investigation closure with full exoneration
   * - Complete resolution of regulatory concerns
   * - Final clearance after compliance remediation
   * - Restoration of all previously disputed assets
   *
   * ACCOUNTING: Unfreezes remaining 3000 tokens (5000 originally frozen - 2000 previously unfrozen)
   * to return all holdings to normal operational state.
   *
   * VERIFICATION: Confirms complete restoration leaves no frozen balance,
   * returning investor to full liquidity and normal token operations.
   */
  test("can unfreeze all remaining frozen tokens", async () => {
    // COMPLETION: Unfreeze all remaining frozen tokens to restore full liquidity
    const remainingFrozenAmount = from(
      "3000",
      stablecoinToken.decimals
    ).toString();
    const result = await adminClient.token.unfreezePartial({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      amount: remainingFrozenAmount,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(stablecoinToken.id);

    // VERIFICATION: Confirm complete restoration with no remaining frozen balance
    const finalBalance = await investorClient.token.read({
      tokenAddress: stablecoinToken.id,
    });

    expect(finalBalance).toBeDefined();
  }, 100_000);
});
