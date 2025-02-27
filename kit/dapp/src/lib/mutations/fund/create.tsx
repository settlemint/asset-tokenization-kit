import { handleChallenge } from '@/lib/challenge';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation for creating a new fund
 *
 * @remarks
 * Creates a new fund contract through the fund factory
 */
const FundFactoryCreate = portalGraphql(`
  mutation FundFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $fundCategory: String!, $fundClass: String!, $managementFeeBps: Int!, $isin: String!) {
    FundFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, isin: $isin, fundCategory: $fundCategory, fundClass: $fundClass, managementFeeBps: $managementFeeBps}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query for predicting the address of a new fund
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateFundPredictAddress = portalGraphql(`
  query CreateFundPredictAddress($address: String!, $sender: String!, $decimals: Int!, $isin: String!, $name: String!, $symbol: String!, $fundCategory: String!, $fundClass: String!, $managementFeeBps: Int!) {
    FundFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        fundCategory: $fundCategory
        fundClass: $fundClass
        managementFeeBps: $managementFeeBps
        name: $name
        symbol: $symbol
        isin: $isin
      ) {
        predicted
      }
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a fund
 *
 * @remarks
 * Stores additional metadata about the fund in Hasura
 */
const CreateOffchainFund = hasuraGraphql(`
  mutation CreateOffchainFund($id: String!, $private: Boolean!) {
    insert_asset_one(object: {id: $id, private: $private}, on_conflict: {constraint: asset_pkey, update_columns: private}) {
      id
    }
  }
`);

/**
 * Zod schema for validating fund creation inputs
 *
 * @property {string} assetName - The name of the fund
 * @property {string} symbol - The symbol of the fund (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} fundCategory - The category of the fund
 * @property {string} fundClass - The class of the fund
 * @property {number} managementFeeBps - The management fee in basis points
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender creating the fund
 * @property {boolean} privateAsset - Whether the asset should be private
 */
export const CreateFundSchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  fundCategory: z.string(),
  fundClass: z.string(),
  managementFeeBps: z.number(),
  pincode: z.pincode(),
  from: z.address(),
  privateAsset: z.boolean(),
});

/**
 * Type definition for fund creation inputs
 */
export type CreateFund = ZodInfer<typeof CreateFundSchema>;

/**
 * React Query hook for creating a new fund
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @remarks
 * This hook handles a multi-step process:
 * 1. Predicts the address of the new fund
 * 2. Creates off-chain metadata in Hasura
 * 3. Deploys the actual fund contract
 *
 * @example
 * ```tsx
 * const createFund = useCreateFund();
 *
 * // Later in your component
 * const handleCreate = async () => {
 *   try {
 *     await createFund.mutateAsync({
 *       assetName: "My Fund",
 *       symbol: "MSC",
 *       decimals: 18,
 *       collateralLivenessSeconds: 86400, // 1 day
 *       pincode: "123456",
 *       from: "0x789...",
 *       privateAsset: false
 *     });
 *     toast.success("Fund created successfully");
 *   } catch (error) {
 *     toast.error("Failed to create fund");
 *   }
 * };
 * ```
 */
export function useCreateFund() {
  const mutation = useMutation({
    mutationKey: ['fund', 'create'],
    mutationFn: async ({
      pincode,
      from,
      assetName,
      symbol,
      decimals,
      isin,
      fundCategory,
      fundClass,
      managementFeeBps,
      privateAsset,
    }: CreateFund) => {
      const predictedAddress = await portalClient.request(
        CreateFundPredictAddress,
        {
          address: STABLE_COIN_FACTORY_ADDRESS,
          sender: from,
          decimals,
          isin: isin ?? '',
          fundCategory,
          fundClass,
          managementFeeBps,
          name: assetName,
          symbol,
        }
      );

      const newAddress =
        predictedAddress.FundFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error('Failed to predict the address');
      }

      await hasuraClient.request(CreateOffchainFund, {
        id: newAddress,
        private: privateAsset,
      });

      const data = await portalClient.request(FundFactoryCreate, {
        address: STABLE_COIN_FACTORY_ADDRESS,
        from: from,
        name: assetName,
        symbol,
        decimals,
        isin: isin ?? '',
        fundCategory,
        fundClass,
        managementFeeBps,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(data.FundFactoryCreate?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: CreateFundSchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
