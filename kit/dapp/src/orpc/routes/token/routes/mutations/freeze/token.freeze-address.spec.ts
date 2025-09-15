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
  let depositToken: Awaited<ReturnType<typeof createToken>>;
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

    // SETUP: Configure token with necessary permissions for comprehensive freeze testing
    // Including custodian role for address freeze operations
    depositToken = await createToken(
      adminClient,
      {
        walletVerification: {
          secretVerificationCode: DEFAULT_PINCODE,
          verificationType: "PINCODE",
        },
        type: "deposit",
        name: `Test Address Freezable Token`,
        symbol: "TAFT",
        decimals: 18,
        initialModulePairs: [],
        basePrice: from("1.00", 2),
        countryCode: "056",
      },
      {
        grantRole: ["supplyManagement", "governance", "custodian"],
        unpause: true,
      }
    );

    expect(depositToken).toBeDefined();
    expect(depositToken.id).toBeDefined();

    // Mint initial balance for investor used by tests
    await adminClient.token.mint({
      contract: depositToken.id,
      recipients: [investorAddress],
      amounts: [from("10000", depositToken.decimals)],
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  }, 100_000);

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
   * SECURITY: Relies on custodian role granted during token setup for freeze authority.
   *
   * ARCHITECTURE: Uses boolean freeze parameter for idempotent freeze/unfreeze operations.
   */
  test("admin can freeze an address", async () => {
    // OPERATION: Complete address freeze blocks all token operations for the address
    // Admin already has custodian role from token setup
    const result = await adminClient.token.freezeAddress({
      contract: depositToken.id,
      userAddress: investorAddress,
      freeze: true,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(depositToken.id);

    // VERIFICATION: Confirm freeze status is reflected in token balance
    const holderData = await investorClient.token.holder({
      tokenAddress: depositToken.id,
      holderAddress: investorAddress,
    });

    expect(holderData.holder).toBeDefined();
    expect(holderData.holder?.isFrozen).toBe(true);
    // Address-level freezing sets the isFrozen flag but doesn't move balance to frozen amount
    // The frozen amount remains 0 while the address is blocked from all operations
    // This differs from partial freezing which moves specific amounts to frozen
    // Note: When address is frozen, subgraph returns balances with decimal 0
    expect(holderData.holder?.frozen).toEqual([0n, 0]);
    expect(holderData.holder?.available).toEqual([0n, 0]);
    // Total value also uses decimal 0 when address is frozen
    expect(holderData.holder?.value).toEqual([10_000n, 0]);
  });

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
      contract: depositToken.id,
      userAddress: investorAddress,
      freeze: false,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(depositToken.id);

    // VERIFICATION: Confirm address can resume normal token operations
    const holderData = await investorClient.token.holder({
      tokenAddress: depositToken.id,
      holderAddress: investorAddress,
    });

    expect(holderData.holder).toBeDefined();
    expect(holderData.holder?.isFrozen).toBe(false);
    // When address is unfrozen, balance should be available again
    // Note: After unfreeze, subgraph returns raw values with decimal 0
    expect(holderData.holder?.frozen).toEqual([0n, 0]);
    expect(holderData.holder?.available).toEqual([10_000n, 0]);
    expect(holderData.holder?.value).toEqual([10_000n, 0]);
  });

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
          contract: depositToken.id,
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

  // NOTE: This test has been removed because all token types (bond, equity, fund, deposit, stablecoin)
  // have CUSTODIAN extension built-in by default. There is no way to create a token without CUSTODIAN
  // through the normal factory flow, making this test scenario invalid.

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
      contract: depositToken.id,
      userAddress: investorAddress,
      freeze: true,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(firstFreeze).toBeDefined();

    // Verify first freeze worked
    const afterFirstFreeze = await adminClient.token.holder({
      tokenAddress: depositToken.id,
      holderAddress: investorAddress,
    });
    expect(afterFirstFreeze.holder?.isFrozen).toBe(true);
    // Address freeze doesn't move balance to frozen, just sets flag
    expect(afterFirstFreeze.holder?.frozen).toEqual([0n, 0]);

    // IDEMPOTENCY: Second freeze on already-frozen address should not fail
    const secondFreeze = await adminClient.token.freezeAddress({
      contract: depositToken.id,
      userAddress: investorAddress,
      freeze: true,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(secondFreeze).toBeDefined();
    expect(secondFreeze.id).toBe(depositToken.id);

    // Verify state remains the same after second freeze
    const afterSecondFreeze = await adminClient.token.holder({
      tokenAddress: depositToken.id,
      holderAddress: investorAddress,
    });
    expect(afterSecondFreeze.holder?.isFrozen).toBe(true);
    // Address freeze maintains balance in available but blocks operations
    expect(afterSecondFreeze.holder?.frozen).toEqual([0n, 0]);
    expect(afterSecondFreeze.holder?.available).toEqual([0n, 0]);

    // CLEANUP: Reset address state to prevent test interference
    await adminClient.token.freezeAddress({
      contract: depositToken.id,
      userAddress: investorAddress,
      freeze: false,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });
  });

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
      contract: depositToken.id,
      userAddress: investorAddress,
      freeze: true,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    // Verify freeze worked
    const afterFreeze = await adminClient.token.holder({
      tokenAddress: depositToken.id,
      holderAddress: investorAddress,
    });
    expect(afterFreeze.holder?.isFrozen).toBe(true);
    // Address freeze sets flag but doesn't move balance amounts
    expect(afterFreeze.holder?.frozen).toEqual([0n, 0]);
    expect(afterFreeze.holder?.available).toEqual([0n, 0]);

    // OPERATION: Initial unfreeze should restore address functionality
    const firstUnfreeze = await adminClient.token.freezeAddress({
      contract: depositToken.id,
      userAddress: investorAddress,
      freeze: false,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(firstUnfreeze).toBeDefined();

    // Verify first unfreeze worked
    const afterFirstUnfreeze = await adminClient.token.holder({
      tokenAddress: depositToken.id,
      holderAddress: investorAddress,
    });
    expect(afterFirstUnfreeze.holder?.isFrozen).toBe(false);
    expect(afterFirstUnfreeze.holder?.frozen).toEqual([0n, 0]);
    expect(afterFirstUnfreeze.holder?.available).toEqual([10_000n, 0]);

    // IDEMPOTENCY: Second unfreeze on already-unfrozen address should not fail
    const secondUnfreeze = await adminClient.token.freezeAddress({
      contract: depositToken.id,
      userAddress: investorAddress,
      freeze: false,
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
    });

    expect(secondUnfreeze).toBeDefined();
    expect(secondUnfreeze.id).toBe(depositToken.id);

    // Verify state remains the same after second unfreeze
    const afterSecondUnfreeze = await adminClient.token.holder({
      tokenAddress: depositToken.id,
      holderAddress: investorAddress,
    });
    expect(afterSecondUnfreeze.holder?.isFrozen).toBe(false);
    expect(afterSecondUnfreeze.holder?.frozen).toEqual([0n, 0]);
    expect(afterSecondUnfreeze.holder?.available).toEqual([10_000n, 0]);
    expect(afterSecondUnfreeze.holder?.value).toEqual([10_000n, 0]);
  });
});
