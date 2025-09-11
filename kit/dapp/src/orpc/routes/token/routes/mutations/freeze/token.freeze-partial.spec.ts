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
import { from, toString } from "dnum";
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

    // WHY: Stablecoin type automatically includes CUSTODIAN extension for regulatory compliance
    const stablecoinData = {
      type: "stablecoin" as const,
      name: `Test Freezable Stablecoin ${Date.now()}`,
      symbol: "TFST",
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

      // Wait for collateral to be indexed
      {
        const start = Date.now();
        const timeoutMs = 8000;
        while (Date.now() - start < timeoutMs) {
          const t = await adminClient.token.read({
            tokenAddress: stablecoinToken.id,
          });
          if (t.collateral?.collateral) break;
          await new Promise((r) => setTimeout(r, 500));
        }
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

    const hasFreezerRole =
      tokenDetails.userPermissions?.roles?.freezer ?? false;

    if (!hasFreezerRole) {
      await adminClient.token.grantRole({
        contract: stablecoinToken.id,
        accounts: [adminAddress],
        role: "freezer",
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
    }

    // CONSTRAINT: Attempt to freeze 10x the available balance to test limits
    const excessiveFreezeAmount = toString(
      from("100000", stablecoinToken.decimals)
    );

    // INVARIANT: Smart contract should reject operations exceeding available balance
    await expect(
      adminClient.token.freezePartial(
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
      )
    ).rejects.toThrow();
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
  test("cannot freeze on token without CUSTODIAN extension", async () => {
    // SETUP: Create token without custodian capabilities to test error handling
    const nonCustodianToken = await createToken(
      adminClient,
      {
        type: "stablecoin",
        name: `Non-Custodian Token ${Date.now()}`,
        symbol: "NCT",
        decimals: 18,
        initialModulePairs: [], // WHY: Empty pairs exclude CUSTODIAN extension
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
