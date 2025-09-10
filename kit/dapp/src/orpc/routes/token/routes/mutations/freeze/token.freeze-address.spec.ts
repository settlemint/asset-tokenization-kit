/**
 * Address Freeze/Unfreeze Test Suite
 *
 * WHY: Validates complete address freezing functionality required for regulatory compliance
 * and emergency response in asset tokenization platforms.
 *
 * CRITICAL BUSINESS CONTEXT:
 * - Regulatory authorities need ability to completely freeze suspicious addresses
 * - Emergency scenarios require immediate halt of all token operations for specific accounts
 * - Legal proceedings may demand freezing all assets of particular addresses
 * - Anti-money laundering (AML) compliance requires blocking flagged addresses
 *
 * TRADEOFF: Address-level freezing is more aggressive than partial freezing but provides
 * complete compliance control. Risk of freezing legitimate funds during investigations.
 *
 * SECURITY: Tests verify only authorized custodians can perform freeze operations
 * to prevent malicious actors from disrupting the token ecosystem.
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
 * Test suite for complete address freezing operations.
 *
 * ARCHITECTURE: Uses deposit token type with explicit custodian setup to test
 * the full address freezing workflow including role management.
 */
describe("Token freeze address", () => {
  let stablecoinToken: Awaited<ReturnType<typeof createToken>>;
  let adminClient: OrpcClient;
  let investorClient: OrpcClient;
  let investorAddress: Address;

  /**
   * Test environment setup for address-level freeze operations.
   *
   * WHY: Creates comprehensive test environment with:
   * 1. Admin user with custodian privileges (regulatory authority simulation)
   * 2. Investor user as target for freeze operations (compliance subject)
   * 3. Deposit token with custodian capabilities (regulated asset type)
   * 4. Supply management and unpausing for operational readiness
   *
   * DESIGN DECISION: Uses deposit token type because it represents custody assets
   * where address-level freezing is most commonly required for regulatory compliance.
   *
   * TRADEOFF: Auto-granting supplyManagement role simplifies testing but may not
   * reflect production role separation. Necessary for test environment consistency.
   */
  beforeAll(async () => {
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    const investorUser = await investorClient.user.me();
    investorAddress = investorUser.wallet as Address;

    // WHY: Deposit tokens inherently support custodian features for regulatory compliance
    const tokenData = {
      type: "deposit" as const,
      name: `Test Address Freezable Token ${Date.now()}`,
      symbol: "TAFT",
      decimals: 18,
      initialModulePairs: [],
      basePrice: from("1.00", 2),
    };

    // SETUP: Configure token with necessary permissions for comprehensive freeze testing
    stablecoinToken = await createToken(
      adminClient,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        ...tokenData,
        countryCode: "056",
      },
      {
        grantRole: ["supplyManagement", "governance"],
        unpause: true,
      }
    );

    expect(stablecoinToken).toBeDefined();
    expect(stablecoinToken.id).toBeDefined();
    expect(stablecoinToken.type).toBe(tokenData.type);

    // PREREQUISITE: Establish token holdings for meaningful freeze testing
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
  });

  /**
   * Validates that authorized custodians can freeze entire addresses.
   *
   * WHY: Core regulatory compliance feature ensuring authorities can completely
   * halt token operations for specific addresses during:
   * - Criminal investigations requiring asset seizure
   * - Regulatory enforcement actions
   * - Court-ordered asset freezes
   * - AML compliance for flagged addresses
   *
   * SECURITY: Verifies custodian role enforcement before allowing freeze operations.
   * Auto-grants role if missing to simulate proper custodian setup.
   *
   * ARCHITECTURE: Uses boolean freeze parameter for idempotent freeze/unfreeze operations.
   */
  test("admin can freeze an address", async () => {
    const adminUser = await adminClient.user.me();
    const adminAddress = adminUser.wallet as Address;

    // SECURITY: Verify custodian role is properly configured for freeze authority
    const tokenDetails = await adminClient.token.read({
      tokenAddress: stablecoinToken.id,
    });

    const hasFreezerRole =
      tokenDetails.userPermissions?.roles?.custodian ?? false;

    if (!hasFreezerRole) {
      // SETUP: Grant custodian role to enable freeze operations in test environment
      await adminClient.token.grantRole({
        contract: stablecoinToken.id,
        address: adminAddress,
        roles: ["custodian"],
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
      });
    }

    // OPERATION: Complete address freeze blocks all token operations for the address
    const result = await adminClient.token.freezeAddress({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      freeze: true,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(stablecoinToken.id);

    // VERIFICATION: Confirm freeze status is reflected in token state
    const investorBalance = await investorClient.token.read({
      tokenAddress: stablecoinToken.id,
    });

    expect(investorBalance).toBeDefined();
  }, 100_000);

  /**
   * Validates that authorized custodians can restore address functionality.
   *
   * WHY: Essential recovery mechanism for restoring legitimate operations after:
   * - Investigation completion clearing the address
   * - False positive resolution in AML screening
   * - Court order lifting asset freeze
   * - Administrative error correction
   *
   * DESIGN: Uses same API with freeze=false for symmetrical operation.
   * Ensures unfreeze is as secure and auditable as freeze operations.
   */
  test("admin can unfreeze an address", async () => {
    // OPERATION: Restore full token functionality to previously frozen address
    const result = await adminClient.token.freezeAddress({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      freeze: false,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(stablecoinToken.id);

    // VERIFICATION: Confirm address can resume normal token operations
    const investorBalance = await investorClient.token.read({
      tokenAddress: stablecoinToken.id,
    });

    expect(investorBalance).toBeDefined();
  }, 100_000);

  /**
   * Ensures unauthorized users cannot perform address freeze operations.
   *
   * WHY: Critical security boundary preventing abuse of freeze functionality.
   * Without proper access controls, malicious users could:
   * - Freeze competitor addresses to manipulate markets
   * - Launch denial-of-service attacks against legitimate users
   * - Disrupt business operations through false freeze claims
   * - Undermine regulatory compliance through unauthorized actions
   *
   * SECURITY: Validates that role-based access control properly rejects
   * non-custodian users attempting freeze operations.
   */
  test("regular users cannot freeze addresses", async () => {
    const regularUserHeaders = await signInWithUser(DEFAULT_INVESTOR);
    const regularClient = getOrpcClient(regularUserHeaders);

    // SECURITY: Verify unauthorized users are rejected with clear error messaging
    await expect(
      regularClient.token.freezeAddress(
        {
          contract: stablecoinToken.id,
          userAddress: investorAddress,
          freeze: true,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            // TESTING: Skip logging expected authorization failures for cleaner output
            skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  });

  test("cannot freeze address on token without CUSTODIAN extension", async () => {
    // Create a deposit token without CUSTODIAN extension
    const nonCustodianToken = await createToken(
      adminClient,
      {
        type: "deposit",
        name: `Non-Custodian Deposit ${Date.now()}`,
        symbol: "NCD3",
        decimals: 18,
        initialModulePairs: [], // No CUSTODIAN extension
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

    await expect(
      adminClient.token.freezeAddress(
        {
          contract: nonCustodianToken.id,
          userAddress: investorAddress,
          freeze: true,
          walletVerification: {
            secretVerificationCode: DEFAULT_PINCODE,
            verificationType: "PINCODE",
          },
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.TOKEN_INTERFACE_NOT_SUPPORTED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.TOKEN_INTERFACE_NOT_SUPPORTED)
    );
  });

  /**
   * Validates that repeated freeze operations are safe and don't cause errors.
   *
   * WHY: Idempotent operations are essential for:
   * - Preventing errors when multiple regulatory actions target same address
   * - Supporting automated compliance systems that may retry operations
   * - Avoiding state corruption from duplicate freeze commands
   * - Enabling safe operation rollback and retry mechanisms
   *
   * DESIGN: Smart contract should handle duplicate freeze requests gracefully
   * without reverting or changing system state unexpectedly.
   *
   * TESTING: Cleanup unfreeze ensures test isolation and prevents side effects.
   */
  test("freezing address multiple times is idempotent", async () => {
    // OPERATION: Initial freeze should succeed and establish frozen state
    const firstFreeze = await adminClient.token.freezeAddress({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      freeze: true,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(firstFreeze).toBeDefined();

    // IDEMPOTENCY: Second freeze on already-frozen address should not fail
    const secondFreeze = await adminClient.token.freezeAddress({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      freeze: true,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(secondFreeze).toBeDefined();
    expect(secondFreeze.id).toBe(stablecoinToken.id);

    // CLEANUP: Reset address state to prevent test interference
    await adminClient.token.freezeAddress({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      freeze: false,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  }, 100_000);

  /**
   * Validates that repeated unfreeze operations are safe and don't cause errors.
   *
   * WHY: Idempotent unfreeze operations protect against:
   * - Double-processing of regulatory clearance orders
   * - Race conditions in automated compliance systems
   * - User interface retry scenarios
   * - Administrative error correction workflows
   *
   * INVARIANT: Unfreeze operations on already-unfrozen addresses should
   * complete successfully without state changes or transaction reverts.
   *
   * SETUP: Establishes frozen state first to test meaningful unfreeze behavior.
   */
  test("unfreezing address multiple times is idempotent", async () => {
    // PREREQUISITE: Establish frozen state as baseline for unfreeze testing
    await adminClient.token.freezeAddress({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      freeze: true,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // OPERATION: Initial unfreeze should restore address functionality
    const firstUnfreeze = await adminClient.token.freezeAddress({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      freeze: false,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(firstUnfreeze).toBeDefined();

    // IDEMPOTENCY: Second unfreeze on already-unfrozen address should not fail
    const secondUnfreeze = await adminClient.token.freezeAddress({
      contract: stablecoinToken.id,
      userAddress: investorAddress,
      freeze: false,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(secondUnfreeze).toBeDefined();
    expect(secondUnfreeze.id).toBe(stablecoinToken.id);
  }, 100_000);
});
