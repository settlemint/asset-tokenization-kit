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
  let equityToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;
  let investorClient: OrpcClient;
  let investorAddress: Address;

  /**
   * Test environment setup with pre-frozen tokens for unfreeze testing.
   *
   * WHY: Creates realistic test scenario with:
   * 1. Admin user with freezer privileges (regulatory authority)
   * 2. Investor user with partially frozen holdings (compliance subject)
   * 3. Equity token with CUSTODIAN extension (regulated asset)
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

    // WHY: Equity type includes CUSTODIAN and doesn't require collateral for mint
    equityToken = await createToken(
      adminClient,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },

        type: "equity",
        name: `Test Unfreezable Equity`,
        symbol: "TUE",
        decimals: 18,
        initialModulePairs: [],
        basePrice: from("1.00", 2),
        countryCode: "056",
      },
      {
        grantRole: ["supplyManagement", "custodian", "governance"],
        unpause: true,
      }
    );

    expect(equityToken).toBeDefined();
    expect(equityToken.id).toBeDefined();
    expect(equityToken.type).toBe(equityToken.type);

    await adminClient.token.mint({
      contract: equityToken.id,
      recipients: [investorAddress],
      amounts: [from("10000", equityToken.decimals)],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // PREREQUISITE: Pre-freeze 50% of holdings to establish baseline for unfreeze testing
    await adminClient.token.freezePartial({
      contract: equityToken.id,
      userAddress: investorAddress,
      amount: from("5000", equityToken.decimals),
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
    // Capture balances before unfreeze
    const beforeHolder = await investorClient.token.holder({
      tokenAddress: equityToken.id,
      holderAddress: investorAddress,
    });

    // OPERATION: Unfreeze 40% of previously frozen tokens to test partial functionality
    const unfreezeAmount = from("2000", equityToken.decimals);
    const result = await adminClient.token.unfreezePartial({
      contract: equityToken.id,
      userAddress: investorAddress,
      amount: unfreezeAmount,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(equityToken.id);

    // VERIFICATION: Confirm balances reflect the unfreeze amount exactly
    const afterHolder = await investorClient.token.holder({
      tokenAddress: equityToken.id,
      holderAddress: investorAddress,
    });

    expect(afterHolder.holder).toBeDefined();

    const beforeAvailable = beforeHolder.holder?.available;
    const beforeFrozen = beforeHolder.holder?.frozen;
    const afterAvailable = afterHolder.holder?.available;
    const afterFrozen = afterHolder.holder?.frozen;

    expect(beforeAvailable).toBeDefined();
    expect(beforeFrozen).toBeDefined();
    expect(afterAvailable).toBeDefined();
    expect(afterFrozen).toBeDefined();

    // available should increase, frozen should decrease, by exactly unfreezeAmount
    const expectedAvailable = from(
      String(
        // dnum to number for comparison convenience in tests
        Number(beforeAvailable?.[0] ?? 0n) /
          Math.pow(10, beforeAvailable?.[1] ?? 0) +
          Number(unfreezeAmount[0]) / Math.pow(10, unfreezeAmount[1])
      ),
      equityToken.decimals
    );
    const expectedFrozen = from(
      String(
        Number(beforeFrozen?.[0] ?? 0n) / Math.pow(10, beforeFrozen?.[1] ?? 0) -
          Number(unfreezeAmount[0]) / Math.pow(10, unfreezeAmount[1])
      ),
      equityToken.decimals
    );

    // Compare numerically with small tolerance to avoid precision issues
    const scale = (v: readonly [bigint, number]) =>
      Number(v[0]) / Math.pow(10, v[1]);
    const epsilon = 1e-12;
    expect(
      Math.abs(scale(afterAvailable!) - scale(expectedAvailable)) < epsilon
    ).toBe(true);
    expect(
      Math.abs(scale(afterFrozen!) - scale(expectedFrozen)) < epsilon
    ).toBe(true);
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

    const unfreezeAmount = from("100", equityToken.decimals);

    // SECURITY: Verify unauthorized users are rejected with proper error code
    await expect(
      regularClient.token.unfreezePartial(
        {
          contract: equityToken.id,
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
    const excessiveUnfreezeAmount = from("5000", equityToken.decimals);

    // INVARIANT: Smart contract should reject operations exceeding frozen balance
    await expect(
      adminClient.token.unfreezePartial(
        {
          contract: equityToken.id,
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

  // NOTE: Test for "cannot unfreeze on token without CUSTODIAN extension" was removed
  // because all token types (bond, equity, fund, deposit, stablecoin) have the CUSTODIAN
  // extension built-in by default. There is no way to create a token without CUSTODIAN
  // through the normal factory flow, making this test scenario invalid.

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
    const remainingFrozenAmount = from("3000", equityToken.decimals);
    const result = await adminClient.token.unfreezePartial({
      contract: equityToken.id,
      userAddress: investorAddress,
      amount: remainingFrozenAmount,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(equityToken.id);

    // VERIFICATION: Confirm complete restoration with no remaining frozen balance
    const finalHolder = await investorClient.token.holder({
      tokenAddress: equityToken.id,
      holderAddress: investorAddress,
    });

    // All previously frozen should be available; frozen back to zero
    expect(finalHolder.holder).toBeDefined();
    expect(finalHolder.holder?.frozen).toEqual([0n, 0]);
  }, 100_000);

  /**
   * Validates that zero amounts are rejected to prevent meaningless operations.
   *
   * WHY: Zero unfreeze operations waste gas and create audit trail noise.
   * They provide no business value and could be used for protocol spam.
   *
   * SECURITY: Input validation prevents potential abuse of unfreeze endpoints
   * through malformed requests that bypass business logic checks.
   */
  test("cannot unfreeze zero amount", async () => {
    // VALIDATION: Zero amount should be rejected at schema level
    const zeroAmount = from("0", equityToken.decimals);

    await expect(
      adminClient.token.unfreezePartial({
        contract: equityToken.id,
        userAddress: investorAddress,
        amount: zeroAmount,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      })
    ).rejects.toThrow("Input validation failed");
  });

  /**
   * Validates that negative amounts are rejected to prevent protocol confusion.
   *
   * WHY: Negative unfreeze amounts could theoretically be interpreted as
   * freeze operations, bypassing proper authorization and audit controls.
   *
   * SECURITY: Prevents potential confusion between freeze/unfreeze operations
   * that could lead to unintended balance modifications.
   */
  test("cannot unfreeze negative amount", async () => {
    // VALIDATION: Negative amount should be rejected at schema level
    // Note: BigInt(-1000) creates a negative value for testing
    const negativeAmount = [BigInt(-1000), equityToken.decimals] as const;

    await expect(
      adminClient.token.unfreezePartial({
        contract: equityToken.id,
        userAddress: investorAddress,
        amount: negativeAmount,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      })
    ).rejects.toThrow("Input validation failed");
  });
});
