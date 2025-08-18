/**
 * Equity Token Creation Handler with Enhanced Security
 *
 * @fileoverview
 * Implements secure equity token deployment through the ATKEquityFactoryImplementation.
 * Equity tokens represent ownership stakes in real-world companies and assets,
 * requiring enhanced compliance and verification due to securities regulations.
 *
 * @remarks
 * EQUITY TOKEN CHARACTERISTICS:
 * - Represents fractional ownership in real-world entities
 * - Subject to securities regulations and compliance requirements
 * - May have voting rights, dividend distributions, and governance features
 * - Requires enhanced KYC/AML verification for compliance
 *
 * SECURITIES COMPLIANCE:
 * - Enhanced verification required due to securities regulations
 * - Country code determines applicable regulatory framework
 * - Compliance modules enforce investor accreditation requirements
 * - Transfer restrictions may apply based on jurisdiction
 *
 * FACTORY DEPLOYMENT PATTERN:
 * - Uses base createToken handler for consistent verification flow
 * - Delegates equity-specific parameter handling to specialized mutation
 * - Inherits access control and compliance integration from base handler
 * - Ensures proper initialization with compliance modules
 *
 * REGULATORY CONSIDERATIONS:
 * - Securities regulations vary by jurisdiction (country code)
 * - Investor accreditation requirements may apply
 * - Transfer restrictions and holding period limitations
 * - Dividend distribution and governance rights integration
 *
 * @see {@link createToken} Base token creation with verification delegation
 * @see {@link ATKEquityFactoryImplementation} Smart contract factory for equity tokens
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import {
  createToken,
  type TokenCreateContext,
} from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { AssetTypeEnum } from "@atk/zod/validators/asset-types";

/**
 * GraphQL mutation for equity token deployment with compliance integration.
 *
 * @remarks
 * EQUITY SPECIALIZATION: Creates equity tokens with securities-specific features
 * including enhanced compliance modules for regulatory adherence. The factory
 * ensures consistent implementation across all equity token deployments.
 *
 * COMPLIANCE INTEGRATION: Initial module pairs typically include:
 * - KYC verification modules for investor identity verification
 * - Accredited investor verification for securities compliance
 * - Transfer restriction modules for regulatory adherence
 * - Jurisdiction-specific compliance based on country code
 *
 * SECURITIES PARAMETERS:
 * - Country code determines applicable securities regulations
 * - Initial module pairs establish compliance framework
 * - Decimals typically 18 for ERC-20 compatibility
 * - Symbol and name follow securities naming conventions
 *
 * @param address - Equity factory contract address from system context
 * @param from - Token creator's wallet address (must have creation permissions)
 * @param symbol - Equity token symbol (e.g., 'AAPL_EQ', 'COMPANY_SHARES')
 * @param name - Human-readable equity token name
 * @param decimals - Token decimal precision (typically 18 for compatibility)
 * @param initialModulePairs - Compliance modules for securities regulations
 * @param countryCode - Jurisdiction code determining applicable regulations
 * @param challengeId - Portal verification challenge ID (auto-injected)
 * @param challengeResponse - MFA challenge response (auto-injected)
 * @returns Object containing transaction hash for monitoring equity deployment
 */
const CREATE_EQUITY_MUTATION = portalGraphql(`
  mutation CreateEquityMutation(
    $address: String!
    $from: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKEquityFactoryImplementationATKEquityFactoryImplementationCreateEquityInitialModulePairsInput!]!
    $challengeId: String
    $challengeResponse: String
    $countryCode: Int!
  ) {
    CreateEquity: ATKEquityFactoryImplementationCreateEquity(
      address: $address
      from: $from
      input: {
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        countryCode_: $countryCode
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Equity token creation handler with securities compliance integration.
 *
 * @remarks
 * SECURITIES COMPLIANCE: Equity tokens require enhanced verification and compliance
 * due to securities regulations. The base createToken handler manages the verification
 * flow while this handler provides equity-specific parameter mapping.
 *
 * DELEGATION PATTERN: Uses createToken base handler for consistent verification
 * and access control while specializing the GraphQL mutation for equity-specific
 * parameters and compliance requirements.
 *
 * COMPLIANCE MAPPING: Transforms generic token creation parameters into
 * equity-specific format including compliance module configuration and
 * regulatory framework selection based on jurisdiction.
 *
 * @param input - Equity token creation parameters including compliance modules
 * @param context - Token creation context with Portal client and verification
 * @returns Transaction hash from successful equity token deployment
 * @throws Error When input type doesn't match equity token requirements
 */
export const equityCreateHandler = async (
  input: TokenCreateInput,
  context: TokenCreateContext
) => {
  // TYPE VALIDATION: Ensure this handler only processes equity token requests
  // WHY: Each token type has specific parameters and compliance requirements
  // Wrong handler could create tokens with incorrect configurations
  if (input.type !== AssetTypeEnum.equity) {
    throw new Error("Invalid token type");
  }

  // DELEGATION PATTERN: Base handler manages verification, this provides equity specialization
  // WHY: Consistent verification flow across all token types while enabling type-specific logic
  // createToken handles wallet verification, permission checks, and transaction tracking
  return createToken(input, context, () => {
    return context.portalClient.mutate(
      CREATE_EQUITY_MUTATION,
      {
        // BASE PARAMETERS: Factory address, sender wallet from context
        ...context.mutationVariables,
        // EQUITY PARAMETERS: Token metadata and compliance configuration
        symbol: input.symbol,
        name: input.name,
        decimals: input.decimals,
        countryCode: input.countryCode,
        // COMPLIANCE MODULES: Map to factory-expected format for proper initialization
        initialModulePairs: input.initialModulePairs.map((pair) => ({
          module: pair.module,
          params: pair.params,
        })),
      },
      // VERIFICATION DELEGATION: Portal middleware enriches with challenge data
      context.walletVerification
    );
  });
};
