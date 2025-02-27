import { handleChallenge } from '@/lib/challenge';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';

/**
 * GraphQL mutation for creating a new equity
 *
 * @remarks
 * Creates a new equity contract through the equity factory
 */
const EquityFactoryCreate = portalGraphql(`
  mutation EquityFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $equityCategory: String!, $equityClass: String!, $isin: String!) {
    EquityFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, isin: $isin, equityCategory: $equityCategory, equityClass: $equityClass}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query for predicting the address of a new equity
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateEquityPredictAddress = portalGraphql(`
  query CreateEquityPredictAddress($address: String!, $sender: String!, $decimals: Int!, $isin: String!, $name: String!, $symbol: String!, $equityCategory: String!, $equityClass: String!) {
    EquityFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        equityCategory: $equityCategory
        equityClass: $equityClass
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
 * GraphQL mutation for creating off-chain metadata for a equity
 *
 * @remarks
 * Stores additional metadata about the equity in Hasura
 */
const CreateOffchainEquity = hasuraGraphql(`
  mutation CreateOffchainEquity($id: String!, $private: Boolean!) {
    insert_asset_one(object: {id: $id, private: $private}, on_conflict: {constraint: asset_pkey, update_columns: private}) {
      id
    }
  }
`);

/**
 * Zod schema for validating equity creation inputs
 *
 * @property {string} assetName - The name of the equity
 * @property {string} symbol - The symbol of the equity (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} equityCategory - The category of the equity
 * @property {string} equityClass - The class of the equity
 * @property {number} managementFeeBps - The management fee in basis points
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender creating the equity
 * @property {boolean} privateAsset - Whether the asset should be private
 */
export const CreateEquitySchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  equityCategory: z.string(),
  equityClass: z.string(),
  pincode: z.pincode(),
  from: z.address(),
  privateAsset: z.boolean(),
});

/**
 * Type definition for equity creation inputs
 */
export type CreateEquity = ZodInfer<typeof CreateEquitySchema>;

/**
 * React Query hook for creating a new equity
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @remarks
 * This hook handles a multi-step process:
 * 1. Predicts the address of the new equity
 * 2. Creates off-chain metadata in Hasura
 * 3. Deploys the actual equity contract
 *
 * @example
 * ```tsx
 * const createEquity = useCreateEquity();
 *
 * // Later in your component
 * const handleCreate = async () => {
 *   try {
 *     await createEquity.mutateAsync({
 *       assetName: "My Equity",
 *       symbol: "MSC",
 *       decimals: 18,
 *       collateralLivenessSeconds: 86400, // 1 day
 *       pincode: "123456",
 *       from: "0x789...",
 *       privateAsset: false
 *     });
 *     toast.success("Equity created successfully");
 *   } catch (error) {
 *     toast.error("Failed to create equity");
 *   }
 * };
 * ```
 */
export function useCreateEquity() {
  const mutation = useMutation({
    mutationKey: ['equity', 'create'],
    mutationFn: async ({
      pincode,
      from,
      assetName,
      symbol,
      decimals,
      isin,
      equityCategory,
      equityClass,
      privateAsset,
    }: CreateEquity) => {
      const predictedAddress = await portalClient.request(
        CreateEquityPredictAddress,
        {
          address: STABLE_COIN_FACTORY_ADDRESS,
          sender: from,
          decimals,
          isin: isin ?? '',
          equityCategory,
          equityClass,
          name: assetName,
          symbol,
        }
      );

      const newAddress =
        predictedAddress.EquityFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error('Failed to predict the address');
      }

      await hasuraClient.request(CreateOffchainEquity, {
        id: newAddress,
        private: privateAsset,
      });

      const data = await portalClient.request(EquityFactoryCreate, {
        address: STABLE_COIN_FACTORY_ADDRESS,
        from: from,
        name: assetName,
        symbol,
        decimals,
        isin: isin ?? '',
        equityCategory,
        equityClass,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(data.EquityFactoryCreate?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: CreateEquitySchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
