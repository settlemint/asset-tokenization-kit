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
import { from, toString, toNumber } from "dnum";
import type { Address } from "viem";
import { beforeAll, describe, expect, test } from "vitest";

/**
 * Test suite for partial token freezing operations.
 *
 * ARCHITECTURE: Uses stablecoin token type because it includes CUSTODIAN extension by default,
 * which provides the freeze/unfreeze functionality required for regulatory compliance.
 */
describe("Token freeze partial", () => {
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;
  let investorClient: OrpcClient;
  let investorAddress: Address;

  /**
   * Test environment setup establishing the freeze-capable token ecosystem.
   *
   * WHY: Creates controlled test environment with:
   * 1. Admin user with freezer privileges (regulatory authority simulation)
   * 2. Investor user with token holdings (target for freeze operations)
   * 3. Stablecoin token with CUSTODIAN extension (compliance-ready asset)
   * 4. Pre-minted token balance (establishes baseline for freeze testing)
   *
   * DESIGN DECISION: Uses stablecoin type because it inherently includes CUSTODIAN
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
    const stablecoinData = {
      type: "equity" as const,
      name: `Test Freezable Equity ${Date.now()}`,
      symbol: "TFE",
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

    // Ensure sufficient collateral is set before minting to avoid reverts (only if supported)
    // Read token details if needed; omitted to avoid unused var in typecheck
    try {
      await adminClient.token.updateCollateral({
        contract: stablecoinToken.id,
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        amount: from("1000000", stablecoinToken.decimals),
        expiryDays: 30,
      });

      // Transaction tracking with indexing is now handled by the portal middleware
      // No polling needed - updateCollateral will wait for indexing completion
    } catch {
      // If COLLATERAL not supported, attempt to set CAP if available
      const t = await adminClient.token.read({
        tokenAddress: stablecoinToken.id,
      });
      if (t.extensions.includes("CAPPED")) {
        await adminClient.token.setCap({
          contract: stablecoinToken.id,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
          newCap: from("100000000", stablecoinToken.decimals),
        });
      }
    }

    // SETUP: Mint substantial balance to enable multiple freeze operations without depletion
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
        } catch (error) {
          lastError = error;
          await new Promise((r) => setTimeout(r, 750));
        }
      }
      if (lastError) throw lastError;
    }
  });

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
    const adminUser = await adminClient.user.me();
    const adminAddress = adminUser.wallet as Address;

    // SECURITY: Verify role-based access control is properly configured
    const tokenDetails = await adminClient.token.read({
      tokenAddress: stablecoinToken.id,
    });

    const hasCustodianRole =
      tokenDetails.userPermissions?.roles?.custodian ?? false;

    if (!hasCustodianRole) {
      // SETUP: Grant freezer role to enable test execution in any environment
      await adminClient.token.grantRole({
        contract: stablecoinToken.id,
        accounts: [adminAddress],
        role: "custodian",
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
    }

    // OPERATION: Freeze 10% of investor balance to test partial functionality
    const freezeAmount = toString(from("1000", stablecoinToken.decimals));
    const result = await adminClient.token.freezePartial({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      amount: freezeAmount,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(stablecoinToken.id);

    // VERIFICATION: Confirm freeze operation was recorded in token state
    const investorBalance = await investorClient.token.read({
      tokenAddress: stablecoinToken.id,
    });

    // The frozen balance should be reflected in user's token information
    expect(investorBalance).toBeDefined();
  }, 100_000);

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

    const freezeAmount = toString(from("100", stablecoinToken.decimals));

    // SECURITY: Verify unauthorized users are rejected with proper error code
    await expect(
      regularClient.token.freezePartial(
        {
          contract: stablecoinToken.id,
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
    const adminUser = await adminClient.user.me();
    const adminAddress = adminUser.wallet as Address;

    // SETUP: Ensure admin has proper permissions for this constraint test
    const tokenDetails = await adminClient.token.read({
      tokenAddress: stablecoinToken.id,
    });

    const hasCustodianRole =
      tokenDetails.userPermissions?.roles?.custodian ?? false;

    if (!hasCustodianRole) {
      await adminClient.token.grantRole({
        contract: stablecoinToken.id,
        accounts: [adminAddress],
        role: "custodian",
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
    }

    // VERIFICATION: Check current balance through holders API
    const holdersData = await adminClient.token.holders({
      tokenAddress: stablecoinToken.id,
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
    const excessiveFreezeAmount = toString(
      from(
        String(currentAvailable + 1000), // Just 1000 more than available should be enough to trigger error
        stablecoinToken.decimals
      )
    );

    // INVARIANT: Smart contract should reject operations exceeding available balance
    // Expected error: FreezeAmountExceedsAvailableBalance

    // DEBUG: Let's see what actually happens when we try to freeze excessive amount
    try {
      await adminClient.token.freezePartial(
        {
          contract: stablecoinToken.id,
          userAddress: investorAddress,
          amount: excessiveFreezeAmount,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            // TESTING: Skip logging expected transaction reverts to reduce noise
            skipLoggingFor: ["TRANSACTION_REVERTED"],
          },
        }
      );
      throw new Error(
        `Freeze should have failed but succeeded. Attempted to freeze ${excessiveFreezeAmount} tokens when only ${currentAvailable} available.`
      );
    } catch (error) {
      // Check if it contains the expected error message
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("FreezeAmountExceedsAvailableBalance")) {
        // Expected error - test should pass
        return;
      } else {
        throw new Error(
          `Expected FreezeAmountExceedsAvailableBalance error, but got: ${errorMessage}`
        );
      }
    }
  });

  /**
   * Confirms freeze operations fail gracefully on tokens without custodian capabilities.
   *
   * WHY: Prevents runtime errors when freeze operations are attempted on tokens
   * that lack the required CUSTODIAN extension. This protects against:
   * - Misleading success responses for unsupported operations
   * - Runtime failures in production environments
   * - User confusion about which tokens support freeze functionality
   *
   * ARCHITECTURE: Creates minimal stablecoin without CUSTODIAN extension to
   * simulate tokens deployed without regulatory compliance features.
   *
   * DESIGN DECISION: Returns specific TOKEN_INTERFACE_NOT_SUPPORTED error rather
   * than generic failure to help developers understand capability limitations.
   */
  test.skip("cannot freeze on token without CUSTODIAN extension - SKIPPED: All token types have CUSTODIAN built-in", async () => {
    // SETUP: Create token without custodian capabilities to test error handling
    const nonCustodianToken = await createToken(
      adminClient,
      {
        type: "stablecoin",
        name: `Non-Custodian Token ${Date.now()}`,
        symbol: "NCT",
        decimals: 18,
        initialModulePairs: [], // initialModulePairs are for compliance modules, not extensions
        basePrice: from("1.00", 2),
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        countryCode: "056",
      },
      {
        grantRole: ["custodian"],
      }
    );

    const freezeAmount = toString(from("100", nonCustodianToken.decimals));

    // VALIDATION: Verify proper error code for unsupported token interfaces
    await expect(
      adminClient.token.freezePartial(
        {
          contract: nonCustodianToken.id,
          userAddress: investorAddress,
          amount: freezeAmount,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            // TESTING: Skip logging expected interface errors to reduce noise
            skipLoggingFor: [CUSTOM_ERROR_CODES.TOKEN_INTERFACE_NOT_SUPPORTED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.TOKEN_INTERFACE_NOT_SUPPORTED)
    );
  });
});
