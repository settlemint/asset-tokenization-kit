import { handleChallenge } from '@/lib/challenge';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useMutation } from '@tanstack/react-query';
import { parseUnits } from 'viem';

/**
 * GraphQL mutation for creating a new bond
 *
 * @remarks
 * Creates a new bond contract through the bond factory
 */
const BondFactoryCreate = portalGraphql(`
  mutation BondFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $isin: String!, $cap: String!, $faceValue: String!, $maturityDate: String!, $underlyingAsset: String!) {
    BondFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, isin: $isin, cap: $cap, faceValue: $faceValue, maturityDate: $maturityDate, underlyingAsset: $underlyingAsset}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query for predicting the address of a new bond
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateBondPredictAddress = portalGraphql(`
  query CreateBondPredictAddress($address: String!, $sender: String!, $decimals: Int!, $isin: String!, $name: String!, $symbol: String!, $cap: String!, $faceValue: String!, $maturityDate: String!, $underlyingAsset: String!) {
    BondFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        isin: $isin
        cap: $cap
        faceValue: $faceValue
        maturityDate: $maturityDate
        underlyingAsset: $underlyingAsset
      ) {
        predicted
      }
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a bond
 *
 * @remarks
 * Stores additional metadata about the bond in Hasura
 */
const CreateOffchainBond = hasuraGraphql(`
  mutation CreateOffchainBond($id: String!, $private: Boolean!) {
    insert_asset_one(object: {id: $id, private: $private}, on_conflict: {constraint: asset_pkey, update_columns: private}) {
      id
    }
  }
`);

/**
 * Zod schema for validating bond creation inputs
 *
 * @property {string} assetName - The name of the bond
 * @property {string} symbol - The symbol of the bond (ticker)
 * @property {number} decimals - The number of decimal places for the token
 * @property {string} [isin] - Optional International Securities Identification Number
 * @property {string} bondCategory - The category of the bond
 * @property {string} bondClass - The class of the bond
 * @property {number} managementFeeBps - The management fee in basis points
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} from - The address of the sender creating the bond
 * @property {boolean} privateAsset - Whether the asset should be private
 */
export const CreateBondSchema = z.object({
  assetName: z.string(),
  symbol: z.symbol(),
  decimals: z.decimals(),
  isin: z.isin().optional(),
  cap: z.amount(),
  faceValue: z.amount(),
  maturityDate: z.date(),
  underlyingAsset: z.address(),
  pincode: z.pincode(),
  from: z.address(),
  privateAsset: z.boolean(),
});

/**
 * Type definition for bond creation inputs
 */
export type CreateBond = ZodInfer<typeof CreateBondSchema>;

/**
 * React Query hook for creating a new bond
 *
 * @returns {Object} Mutation object with additional schema information
 *
 * @remarks
 * This hook handles a multi-step process:
 * 1. Predicts the address of the new bond
 * 2. Creates off-chain metadata in Hasura
 * 3. Deploys the actual bond contract
 *
 * @example
 * ```tsx
 * const createBond = useCreateBond();
 *
 * // Later in your component
 * const handleCreate = async () => {
 *   try {
 *     await createBond.mutateAsync({
 *       assetName: "My Bond",
 *       symbol: "MSC",
 *       decimals: 18,
 *       collateralLivenessSeconds: 86400, // 1 day
 *       pincode: "123456",
 *       from: "0x789...",
 *       privateAsset: false
 *     });
 *     toast.success("Bond created successfully");
 *   } catch (error) {
 *     toast.error("Failed to create bond");
 *   }
 * };
 * ```
 */
export function useCreateBond() {
  const mutation = useMutation({
    mutationKey: ['bond', 'create'],
    mutationFn: async ({
      pincode,
      from,
      assetName,
      symbol,
      decimals,
      isin,
      cap,
      faceValue,
      maturityDate,
      underlyingAsset,
      privateAsset,
    }: CreateBond) => {
      const predictedAddress = await portalClient.request(
        CreateBondPredictAddress,
        {
          address: STABLE_COIN_FACTORY_ADDRESS,
          sender: from,
          decimals,
          isin: isin ?? '',
          cap: parseUnits(cap.toString(), decimals).toString(),
          // TODO: wrong, needs to get the decimals of the underlying asset
          faceValue: parseUnits(faceValue.toString(), decimals).toString(),
          maturityDate: maturityDate.toISOString(),
          underlyingAsset,
          name: assetName,
          symbol,
        }
      );

      const newAddress =
        predictedAddress.BondFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error('Failed to predict the address');
      }

      await hasuraClient.request(CreateOffchainBond, {
        id: newAddress,
        private: privateAsset,
      });

      const data = await portalClient.request(BondFactoryCreate, {
        address: STABLE_COIN_FACTORY_ADDRESS,
        from: from,
        name: assetName,
        symbol,
        decimals,
        isin: isin ?? '',
        cap: parseUnits(cap.toString(), decimals).toString(),
        // TODO: wrong, needs to get the decimals of the underlying asset
        faceValue: parseUnits(faceValue.toString(), decimals).toString(),
        maturityDate: maturityDate.toISOString(),
        underlyingAsset,
        challengeResponse: await handleChallenge(from, pincode),
      });

      return z.hash().parse(data.BondFactoryCreate?.transactionHash);
    },
  });

  return {
    ...mutation,
    inputSchema: CreateBondSchema,
    outputSchema: z.hash(),
    invalidateKeys: () => [['user'], ['transaction'], ['asset']],
  };
}
