import { handleChallenge } from '@/lib/challenge';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

/**
 * GraphQL mutation for creating a new cryptocurrency
 *
 * @remarks
 * Creates a new cryptocurrency contract through the cryptocurrency factory
 */
const CryptoCurrencyFactoryCreate = portalGraphql(`
  mutation CryptoCurrencyFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $initialSupply: String!) {
    CryptoCurrencyFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, initialSupply: $initialSupply}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query for predicting the address of a new cryptocurrency
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateCryptoCurrencyPredictAddress = portalGraphql(`
  query CreateCryptoCurrencyPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $initialSupply: String!) {
    CryptoCurrencyFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        initialSupply: $initialSupply
        name: $name
        symbol: $symbol
      ) {
        predicted
      }
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a cryptocurrency
 *
 * @remarks
 * Stores additional metadata about the cryptocurrency in Hasura
 */
const CreateOffchainCryptoCurrency = hasuraGraphql(`
  mutation CreateOffchainCryptoCurrency($id: String!, $private: Boolean!) {
    insert_asset_one(object: {id: $id, private: $private}, on_conflict: {constraint: asset_pkey, update_columns: private}) {
      id
    }
  }
`);

/**
 * Zod schema for validating cryptocurrency creation inputs
 *
 * @property {string} assetName - The name of the cryptocurrency
 * @property {string} symbol - The symbol of the cryptocurrency (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} cryptocurrencyCategory - The category of the cryptocurrency
 * @property {string} cryptocurrencyClass - The class of the cryptocurrency
 * @property {number} managementFeeBps - The management fee in basis points
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender creating the cryptocurrency
 * @property {boolean} privateAsset - Whether the asset should be private
 */
export const CreateCryptoCurrencySchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  initialSupply: z.amount(),
  pincode: z.pincode(),
  from: z.address(),
  privateAsset: z.boolean(),
});

/**
 * Type definition for cryptocurrency creation inputs
 */
export type CreateCryptoCurrency = ZodInfer<typeof CreateCryptoCurrencySchema>;

/**
 * React Query hook for creating a new cryptocurrency
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @remarks
 * This hook handles a multi-step process:
 * 1. Predicts the address of the new cryptocurrency
 * 2. Creates off-chain metadata in Hasura
 * 3. Deploys the actual cryptocurrency contract
 *
 * @example
 * ```tsx
 * const createCryptoCurrency = useCreateCryptoCurrency();
 *
 * // Later in your component
 * const handleCreate = async () => {
 *   try {
 *     await createCryptoCurrency.mutateAsync({
 *       assetName: "My CryptoCurrency",
 *       symbol: "MSC",
 *       decimals: 18,
 *       collateralLivenessSeconds: 86400, // 1 day
 *       pincode: "123456",
 *       from: "0x789...",
 *       privateAsset: false
 *     });
 *     toast.success("CryptoCurrency created successfully");
 *   } catch (error) {
 *     toast.error("Failed to create cryptocurrency");
 *   }
 * };
 * ```
 */
export function useCreateCryptoCurrency() {
  const mutation = useMutation({
    mutationKey: ['cryptocurrency', 'create'],
    mutationFn: async ({
      pincode,
      from,
      assetName,
      symbol,
      decimals,
      initialSupply,
      privateAsset,
    }: CreateCryptoCurrency) => {
      const predictedAddress = await portalClient.request(
        CreateCryptoCurrencyPredictAddress,
        {
          address: STABLE_COIN_FACTORY_ADDRESS,
          sender: from,
          decimals,
          initialSupply: parseUnits(
            initialSupply.toString(),
            decimals
          ).toString(),
          name: assetName,
          symbol,
        }
      );

      const newAddress =
        predictedAddress.CryptoCurrencyFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error('Failed to predict the address');
      }

      await hasuraClient.request(CreateOffchainCryptoCurrency, {
        id: newAddress,
        private: privateAsset,
      });

      const data = await portalClient.request(CryptoCurrencyFactoryCreate, {
        address: STABLE_COIN_FACTORY_ADDRESS,
        from: from,
        name: assetName,
        symbol,
        decimals,
        initialSupply: parseUnits(
          initialSupply.toString(),
          decimals
        ).toString(),
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(data.CryptoCurrencyFactoryCreate?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: CreateCryptoCurrencySchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
