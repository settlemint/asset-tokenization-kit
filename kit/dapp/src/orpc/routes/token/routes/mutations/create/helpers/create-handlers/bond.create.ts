/**
 * Bond Token Creation Handler with Wallet Verification
 *
 * @remarks
 * This handler demonstrates the wallet verification pattern in token creation operations.
 * Bond tokens have complex financial parameters (face value, maturity, denomination) that
 * require enhanced security verification before blockchain deployment.
 *
 * VERIFICATION INTEGRATION:
 * - Token creation requires wallet verification due to financial implications
 * - Uses createToken base handler which delegates verification to Portal middleware
 * - Verification type and code are passed through walletVerification context
 *
 * FINANCIAL SECURITY:
 * - Bond tokens represent real-world debt instruments with legal implications
 * - Face value and maturity date determine financial obligations
 * - Enhanced verification prevents unauthorized token creation with incorrect parameters
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Bond creation is computationally expensive due to compliance module initialization
 * - Verification adds minimal overhead compared to contract deployment
 * - Factory pattern enables consistent verification across all token types
 *
 * @see {@link createToken} Base token creation with verification delegation
 * @see {@link ATKBondFactoryImplementation} Smart contract factory for bond tokens
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import type { TokenCreateContext } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import { createToken } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { AssetTypeEnum } from "@atk/zod/asset-types";

const CREATE_BOND_MUTATION = portalGraphql(`
  mutation CreateBondMutation(
    $address: String!
    $from: String!
    $symbol: String!
    $name: String!
    $decimals: Int!
    $initialModulePairs: [ATKBondFactoryImplementationATKBondFactoryImplementationCreateBondInitialModulePairsInput!]!
    $cap: String!
    $faceValue: String!
    $maturityDate: String!
    $denominationAsset: String!
    $challengeId: String
    $challengeResponse: String
    $countryCode: Int!
  ) {
    CreateBond: ATKBondFactoryImplementationCreateBond(
      address: $address
      from: $from
      input: {
        symbol_: $symbol
        name_: $name
        decimals_: $decimals
        initialModulePairs_: $initialModulePairs
        cap_: $cap
        bondParams: {
          faceValue: $faceValue
          maturityDate: $maturityDate
          denominationAsset: $denominationAsset
        }
        countryCode_: $countryCode
      }
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const bondCreateHandler = async (
  input: TokenCreateInput,
  context: TokenCreateContext
) => {
  if (input.type !== AssetTypeEnum.bond) {
    throw new Error("Invalid token type");
  }

  // DELEGATION PATTERN: createToken base handler manages verification flow
  // WHY: Consistent verification handling across all token types while allowing
  // type-specific parameter validation and mutation execution
  return createToken(input, context, () => {
    return context.portalClient.mutate(
      CREATE_BOND_MUTATION,
      {
        // PARAMETER MAPPING: Base variables (address, from) from context
        ...context.mutationVariables,
        // BOND-SPECIFIC: Financial parameters requiring verification
        symbol: input.symbol,
        name: input.name,
        decimals: input.decimals,
        countryCode: input.countryCode,
        cap: input.cap.toString(),
        faceValue: input.faceValue.toString(),
        maturityDate: input.maturityDate,
        denominationAsset: input.denominationAsset,
        initialModulePairs: input.initialModulePairs.map((pair) => ({
          module: pair.module,
          params: pair.params,
        })),
      },
      // VERIFICATION DELEGATION: Portal middleware enriches with challengeId/challengeResponse
      context.walletVerification
    );
  });
};
