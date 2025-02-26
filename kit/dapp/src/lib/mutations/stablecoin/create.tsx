import { handleChallenge } from '@/lib/challenge';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { getQueryKey as stablecoinListQueryKey } from '@/lib/queries/stablecoin/stablecoin-list';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation for creating a new stablecoin
 *
 * @remarks
 * Creates a new stablecoin contract through the stablecoin factory
 */
const StableCoinFactoryCreate = portalGraphql(`
  mutation StableCoinFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $collateralLivenessSeconds: Float!, $isin: String!) {
    StableCoinFactoryCreate(
      address: $address
      from: $from
      input: {collateralLivenessSeconds: $collateralLivenessSeconds, name: $name, symbol: $symbol, decimals: $decimals, isin: $isin}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query for predicting the address of a new stablecoin
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateStablecoinPredictAddress = portalGraphql(`
  query CreateStablecoinPredictAddress($address: String!, $sender: String!, $decimals: Int!, $isin: String!, $name: String!, $symbol: String!, $collateralLivenessSeconds: Float!) {
    StableCoinFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        collateralLivenessSeconds: $collateralLivenessSeconds
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
 * GraphQL mutation for creating off-chain metadata for a stablecoin
 *
 * @remarks
 * Stores additional metadata about the stablecoin in Hasura
 */
const CreateOffchainStablecoin = hasuraGraphql(`
  mutation CreateOffchainStablecoin($id: String!, $private: Boolean!) {
    insert_asset_one(object: {id: $id, private: $private}, on_conflict: {constraint: asset_pkey, update_columns: private}) {
      id
    }
  }
`);

/**
 * Zod schema for validating stablecoin creation inputs
 *
 * @property {string} assetName - The name of the stablecoin
 * @property {string} symbol - The symbol of the stablecoin (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {number} collateralLivenessSeconds - Time period for collateral validity
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender creating the stablecoin
 * @property {boolean} privateAsset - Whether the asset should be private
 */
export const CreateStablecoinSchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  collateralLivenessSeconds: z.number(),
  pincode: z.pincode(),
  from: z.address(),
  privateAsset: z.boolean(),
});

/**
 * Type definition for stablecoin creation inputs
 */
export type CreateStablecoin = ZodInfer<typeof CreateStablecoinSchema>;

/**
 * React Query hook for creating a new stablecoin
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @remarks
 * This hook handles a multi-step process:
 * 1. Predicts the address of the new stablecoin
 * 2. Creates off-chain metadata in Hasura
 * 3. Deploys the actual stablecoin contract
 *
 * @example
 * ```tsx
 * const createStablecoin = useCreateStablecoin();
 *
 * // Later in your component
 * const handleCreate = async () => {
 *   try {
 *     await createStablecoin.mutateAsync({
 *       assetName: "My Stablecoin",
 *       symbol: "MSC",
 *       decimals: 18,
 *       collateralLivenessSeconds: 86400, // 1 day
 *       pincode: "123456",
 *       from: "0x789...",
 *       privateAsset: false
 *     });
 *     toast.success("Stablecoin created successfully");
 *   } catch (error) {
 *     toast.error("Failed to create stablecoin");
 *   }
 * };
 * ```
 */
export function useCreateStablecoin() {
  const mutation = useMutation({
    mutationKey: ['stablecoin', 'create'],
    mutationFn: async ({
      pincode,
      from,
      assetName,
      symbol,
      decimals,
      isin,
      collateralLivenessSeconds,
      privateAsset,
    }: CreateStablecoin) => {
      const predictedAddress = await portalClient.request(
        CreateStablecoinPredictAddress,
        {
          address: STABLE_COIN_FACTORY_ADDRESS,
          sender: from,
          decimals,
          isin: isin ?? '',
          collateralLivenessSeconds,
          name: assetName,
          symbol,
        }
      );

      const newAddress =
        predictedAddress.StableCoinFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error('Failed to predict the address');
      }

      await hasuraClient.request(CreateOffchainStablecoin, {
        id: newAddress,
        private: privateAsset,
      });

      const data = await portalClient.request(StableCoinFactoryCreate, {
        address: STABLE_COIN_FACTORY_ADDRESS,
        from: from,
        name: assetName,
        symbol,
        decimals,
        isin: isin ?? '',
        collateralLivenessSeconds: collateralLivenessSeconds,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(data.StableCoinFactoryCreate?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: CreateStablecoinSchema,
    outputSchema: z.hash(),
    invalidateKeys: (_variables: CreateStablecoin) => [
      stablecoinListQueryKey(),
    ],
  };
}
