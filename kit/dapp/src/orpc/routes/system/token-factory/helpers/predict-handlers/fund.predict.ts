/**
 * Fund Token Address Prediction Handler
 *
 * @remarks
 * This handler implements deterministic address prediction for fund tokens using
 * CREATE2 deployment patterns. It enables UI preview of fund addresses before
 * actual deployment, improving user experience and enabling address-dependent
 * integrations to be prepared in advance.
 *
 * ARCHITECTURAL PATTERN:
 * - Handler pattern for asset-type-specific prediction logic
 * - GraphQL delegation to Portal for CREATE2 calculation
 * - Type-safe validation with Zod schemas
 * - Deterministic address generation based on fund parameters
 *
 * BUSINESS CONTEXT:
 * - Fund tokens represent investment portfolios with underlying assets
 * - Management fees are specified in basis points (1 bps = 0.01%)
 * - Initial module pairs define compliance and operational modules
 * - Address prediction enables pre-deployment integrations and UI previews
 *
 * SECURITY CONSIDERATIONS:
 * - Input validation prevents malformed prediction requests
 * - Portal handles CREATE2 salt generation and address calculation
 * - Predicted addresses are deterministic but not guaranteed until deployment
 *
 * @see {@link PredictHandlerContext} Shared context for all prediction handlers
 * @see {@link AssetTypeEnum} Asset type enumeration for type discrimination
 * @see {@link PredictAddressInput} Input schema for address prediction
 */

import { encodeComplianceParams } from "@/lib/compliance/encoding/index";
import { portalGraphql } from "@/lib/settlemint/portal";
import {
  type PredictAddressInput,
  type PredictAddressOutput,
  PredictAddressOutputSchema,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";
import z from "zod";
import type { PredictHandlerContext } from "./handler-map";

/**
 * GraphQL query for fund address prediction via Portal.
 *
 * @remarks
 * PARAMETER MAPPING: The query parameters correspond to fund-specific deployment
 * parameters that affect the CREATE2 salt calculation:
 * - symbol_: Token symbol (e.g., "FUND1")
 * - name_: Token name (e.g., "Tech Growth Fund")
 * - decimals_: Token decimal precision (typically 18)
 * - initialModulePairs_: Compliance and operational modules
 * - managementFeeBps_: Management fee in basis points
 *
 * DETERMINISTIC CALCULATION: Portal uses these parameters to generate the same
 * CREATE2 salt that will be used during actual deployment, ensuring the
 * predicted address matches the deployed address.
 *
 * FACTORY PATTERN: The query targets a specific factory implementation address
 * to ensure predictions are accurate for the intended deployment context.
 */
const PREDICT_FUND_ADDRESS_QUERY = portalGraphql(`
  query PredictFundAddress(
    $address: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKFundFactoryImplementationPredictFundAddressInitialModulePairsInput!]!
    $managementFeeBps: Int!
  ) {
    ATKFundFactoryImplementation(address: $address) {
      predictFundAddress(
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        managementFeeBps_: $managementFeeBps
      ) {
        predictedAddress
      }
    }
  }
`);

/**
 * Predicts the deployment address for a fund token based on its parameters.
 *
 * @remarks
 * HANDLER PATTERN: This function implements the prediction handler interface
 * for fund tokens, enabling polymorphic address prediction across different
 * asset types through the handler map pattern.
 *
 * TYPE DISCRIMINATION: Validates that the input is specifically for fund tokens
 * to prevent incorrect handler usage and ensure type safety.
 *
 * PORTAL DELEGATION: Delegates the complex CREATE2 calculation to Portal's
 * GraphQL API, which has access to the factory contract's salt generation logic.
 *
 * VALIDATION PIPELINE: Uses Zod schemas to validate both input parameters and
 * Portal's response, ensuring type safety throughout the prediction process.
 *
 * @param input - Fund token parameters for address prediction
 * @param context - Shared prediction context with Portal client and factory address
 * @returns Promise resolving to the predicted fund token address
 * @throws Error when input type is not 'fund'
 * @throws PORTAL_ERROR when GraphQL query fails or response is invalid
 * @example
 * ```typescript
 * const prediction = await fundPredictHandler({
 *   type: AssetTypeEnum.fund,
 *   symbol: "TECHFUND",
 *   name: "Technology Growth Fund",
 *   decimals: 18,
 *   initialModulePairs: [
 *     { module: "0x123...", data: "0x456..." }
 *   ],
 *   managementFeeBps: 200 // 2% management fee
 * }, {
 *   portalClient: validatedPortalClient,
 *   factoryAddress: "0x789..."
 * });
 *
 * console.log(prediction.predictedAddress); // "0xabc..."
 * ```
 */
export const fundPredictHandler = async (
  input: PredictAddressInput,
  context: PredictHandlerContext
): Promise<PredictAddressOutput> => {
  // TYPE DISCRIMINATION: Ensure this handler only processes fund token requests
  // WHY: Prevents incorrect handler usage and maintains type safety in the handler map
  if (input.type !== AssetTypeEnum.fund) {
    throw new Error("Invalid token type");
  }

  // PORTAL DELEGATION: Query Portal for CREATE2 address calculation
  // WHY: Portal has access to factory contract logic and CREATE2 salt generation
  // that would be complex to replicate in the application layer
  const { basePrice: _, ...params } = input;
  const result = await context.portalClient.query(
    PREDICT_FUND_ADDRESS_QUERY,
    {
      address: context.factoryAddress, // Factory contract address for prediction
      from: context.walletAddress,
      ...params, // Spread fund parameters (symbol, name, decimals, etc.)
      initialModulePairs: input.initialModulePairs.map((pair) => ({
        module: pair.module,
        params: encodeComplianceParams(pair),
      })),
    },
    // RESPONSE VALIDATION: Ensure Portal returns expected address format
    z.object({
      ATKFundFactoryImplementation: z.object({
        predictFundAddress: PredictAddressOutputSchema, // Validates address format
      }),
    })
  );

  // EXTRACT RESULT: Return the predicted address from Portal's response
  return result.ATKFundFactoryImplementation.predictFundAddress;
};
