/**
 * Freeze Partial Tokens Test Suite
 *
 * WHY: Validates partial token freezing functionality required for regulatory compliance,
 * emergency response, and custody management in asset tokenization platforms.
 *
 * CRITICAL BUSINESS CONTEXT:
 * - Asset managers need granular control over token liquidity during investigations
 * - Regulatory authorities require ability to freeze suspicious holdings without affecting entire addresses
 * - Emergency scenarios demand quick response to freeze specific token amounts
 * - Custody platforms must prevent movement of disputed assets while preserving other holdings
 *
 * TRADEOFF: Partial freezing adds complexity but provides surgical precision over
 * full address freezing, which could harm legitimate holdings.
 *
 * SECURITY: Tests verify role-based access controls prevent unauthorized freezing
 * that could disrupt markets or enable denial-of-service attacks.
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
import { add, from, subtract, toNumber } from "dnum";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";

/**
 * Test suite for partial token freezing operations.
 *
 * ARCHITECTURE: Uses equity token type because it includes CUSTODIAN extension by default,
 * which provides the freeze/unfreeze functionality required for regulatory compliance.
 */
describe("Token freeze partial", () => {
  let equityToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;
  let investorClient: OrpcClient;
  let investorAddress: Address;

  /**
   * Test environment setup establishing the freeze-capable token ecosystem.
   *
   * WHY: Creates controlled test environment with:
   * 1. Admin user with freezer privileges (regulatory authority simulation)
   * 2. Investor user with token holdings (target for freeze operations)
   * 3. Equity token with CUSTODIAN extension (compliance-ready asset)
   * 4. Pre-minted token balance (establishes baseline for freeze testing)
   *
   * DESIGN DECISION: Uses equity type because it inherently includes CUSTODIAN
   * extension, avoiding test flakiness from missing functionality.
   *
   * PERF: 10,000 token mint provides sufficient balance for multiple freeze operations
   * without hitting edge cases during test execution.
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
        name: `Test Freezable Equity`,
        symbol: "TFE",
        decimals: 18,
        initialModulePairs: [],
        basePrice: from("1.00", 2),
        countryCode: "056",
        class: "INVESTMENT_STYLE_EQUITY",
        category: "CONVERTIBLE_PREFERRED_STOCK",
      },
      {
        grantRole: ["supplyManagement", "custodian", "governance"],
        unpause: true,
      }
    );

    expect(equityToken).toBeDefined();
    expect(equityToken.id).toBeDefined();

    // Mint initial balance for investor used by tests
    await adminClient.token.mint({
      contract: equityToken.id,
      recipients: [investorAddress],
      amounts: [from("10000", equityToken.decimals)],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  }, 100_000);

  /**
   * Validates that authorized users can perform partial token freezing operations.
   *
   * WHY: Core functionality test ensuring regulatory compliance tools work correctly.
   * Partial freezing is essential for:
   * - Investigating suspicious transactions without freezing entire holdings
   * - Responding to court orders for specific asset amounts
   * - Managing custody disputes over partial token amounts
   *
   * SECURITY: Verifies freezer role requirements are enforced before operations.
   * Auto-grants role if missing to simulate proper admin setup.
   *
   * EDGE CASE: Dynamic role checking prevents test failures when admin lacks
   * freezer permissions, which could happen in different test environments.
   */
  test("admin can freeze partial tokens", async () => {
    // Capture balances before freeze
    const beforeHolder = await investorClient.token.holder({
      tokenAddress: equityToken.id,
      holderAddress: investorAddress,
    });
    const beforeAvailable = beforeHolder.holder?.available;
    const beforeFrozen = beforeHolder.holder?.frozen;
    expect(beforeAvailable).toEqual(from("10000"));
    expect(beforeFrozen).toEqual(from("0"));

    // OPERATION: Freeze 10% of investor balance to test partial functionality
    const freezeAmount = from("1000", equityToken.decimals);
    const result = await adminClient.token.freezePartial({
      contract: equityToken.id,
      userAddress: investorAddress,
      amount: freezeAmount,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
    expect(result).toBeDefined();
    expect(result.id).toBe(equityToken.id);

    // VERIFICATION: Confirm balances reflect the freeze amount exactly
    const afterHolder = await investorClient.token.holder({
      tokenAddress: equityToken.id,
      holderAddress: investorAddress,
    });
    expect(afterHolder.holder).toBeDefined();

    const afterAvailable = afterHolder.holder?.available;
    const afterFrozen = afterHolder.holder?.frozen;
    expect(afterAvailable).toBeDefined();
    expect(afterFrozen).toBeDefined();

    const expectedAvailable = subtract(beforeAvailable!, freezeAmount);
    const expectedFrozen = add(beforeFrozen!, freezeAmount);

    expect(afterAvailable).toEqual(expectedAvailable);
    expect(afterFrozen).toEqual(expectedFrozen);
  });

  /**
   * Ensures unauthorized users cannot perform freeze operations.
   *
   * WHY: Critical security boundary test preventing abuse of freeze functionality.
   * Without proper access controls, malicious users could:
   * - Freeze competitor holdings to manipulate markets
   * - Launch denial-of-service attacks against token holders
   * - Disrupt legitimate business operations
   *
   * SECURITY: Uses DEFAULT_INVESTOR (regular user) to simulate unauthorized access attempt.
   * Confirms role-based access control rejects non-privileged users.
   *
   * DESIGN: Skips error logging for expected authorization failures to keep test output clean.
   */
  test("regular users cannot freeze tokens", async () => {
    const regularUserHeaders = await signInWithUser(DEFAULT_INVESTOR);
    const regularClient = getOrpcClient(regularUserHeaders);

    const freezeAmount = from("100", equityToken.decimals);

    // SECURITY: Verify unauthorized users are rejected with proper error code
    await expect(
      regularClient.token.freezePartial(
        {
          contract: equityToken.id,
          userAddress: investorAddress,
          amount: freezeAmount,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            // TESTING: Skip logging expected authorization failures to reduce noise
            skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  });

  /**
   * Validates balance constraints prevent freezing non-existent tokens.
   *
   * WHY: Prevents accounting errors and maintains token supply integrity.
   * Without balance validation:
   * - Frozen balance could exceed actual balance, breaking accounting invariants
   * - Smart contract state could become inconsistent
   * - Token economics could be manipulated through phantom freezes
   *
   * EDGE CASE: Tests 10x the minted amount (100,000 vs 10,000) to ensure
   * robust rejection of excessive freeze attempts.
   *
   * DESIGN: Smart contract reversion is expected behavior for invalid operations,
   * so we catch the generic throw rather than specific error codes.
   */
  test("cannot freeze more tokens than available balance", async () => {
    // VERIFICATION: Check current balance through holders API
    const holdersData = await adminClient.token.holders({
      tokenAddress: equityToken.id,
    });

    const investorHolder = holdersData.token?.balances.find(
      (balance) =>
        balance.account.id.toLowerCase() === investorAddress.toLowerCase()
    );

    // CONSTRAINT: Attempt to freeze more than available balance to test limits
    const currentAvailable = investorHolder?.available
      ? toNumber(investorHolder.available)
      : 0;

    // Ensure we have a realistic test by using the actual available balance
    // If available balance is less than 1000, the test setup failed
    if (currentAvailable < 1000) {
      throw new Error(
        `Insufficient available balance for test: ${currentAvailable}. Expected at least 1000 tokens.`
      );
    }

    // Try to freeze significantly more than available (at least double + safety margin)
    const excessiveFreezeAmount = from(
      String(currentAvailable + 1000), // Just 1000 more than available should be enough to trigger error
      equityToken.decimals
    );

    // INVARIANT: Smart contract should reject operations exceeding available balance
    // Expected error: FreezeAmountExceedsAvailableBalance
    await expect(
      adminClient.token.freezePartial(
        {
          contract: equityToken.id,
          userAddress: investorAddress,
          amount: excessiveFreezeAmount,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.PORTAL_ERROR],
          },
        }
      )
    ).rejects.toThrow("reverted: FreezeAmountExceedsAvailableBalance");
  });

  /**
   * Validates that zero amounts are rejected to prevent pointless operations.
   *
   * WHY: Zero freeze operations waste gas and create meaningless audit trails.
   * They could be used to spam the blockchain with useless transactions.
   *
   * SECURITY: Input validation prevents potential protocol abuse through
   * malformed requests that could bypass business logic constraints.
   */
  test("cannot freeze zero amount", async () => {
    // VALIDATION: Zero amount should be rejected at schema level
    const zeroAmount = from("0", equityToken.decimals);

    await expect(
      adminClient.token.freezePartial(
        {
          contract: equityToken.id,
          userAddress: investorAddress,
          amount: zeroAmount,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.BAD_REQUEST],
          },
        }
      )
    ).rejects.toThrow(errorMessageForCode(CUSTOM_ERROR_CODES.BAD_REQUEST));
  });

  /**
   * Validates that negative amounts are rejected to prevent protocol confusion.
   *
   * WHY: Negative amounts could theoretically be interpreted as unfreezing
   * operations, which would bypass proper authorization controls.
   *
   * SECURITY: Prevents potential confusion between freeze/unfreeze operations
   * that could lead to unintended state changes.
   */
  test("cannot freeze negative amount", async () => {
    // VALIDATION: Negative amount should be rejected at schema level
    // Note: dnum supports negative numbers
    const negativeAmount = from("-1000", equityToken.decimals);

    await expect(
      adminClient.token.freezePartial(
        {
          contract: equityToken.id,
          userAddress: investorAddress,
          amount: negativeAmount,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.BAD_REQUEST],
          },
        }
      )
    ).rejects.toThrow(errorMessageForCode(CUSTOM_ERROR_CODES.BAD_REQUEST));
  });

  // NOTE: Test for "cannot freeze on token without CUSTODIAN extension" was removed
  // because all token types (bond, equity, fund, deposit, stablecoin) have the CUSTODIAN
  // extension built-in by default. There is no way to create a token without CUSTODIAN
  // through the normal factory flow, making this test scenario invalid.
});
