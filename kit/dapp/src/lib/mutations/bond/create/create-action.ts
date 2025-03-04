"use server";

import { handleChallenge } from "@/lib/challenge";
import { BOND_FACTORY_ADDRESS } from "@/lib/contracts";
import { parseEther } from "@/lib/ether";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { CreateBondSchema } from "./create-schema";

/**
 * GraphQL mutation for creating a new bond
 *
 * @remarks
 * Creates a new bond contract through the bond factory
 */
const BondFactoryCreate = portalGraphql(`
  mutation BondFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $cap: String!, $faceValue: String!, $maturityDate: String!, $underlyingAsset: String!) {
    BondFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, cap: $cap, faceValue: $faceValue, maturityDate: $maturityDate, underlyingAsset: $underlyingAsset}
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
  query CreateBondPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $cap: String!, $faceValue: String!, $maturityDate: String!, $underlyingAsset: String!) {
    BondFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
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
  mutation CreateOffchainBond($id: String!, $isin: String) {
    insert_asset_one(object: {id: $id, isin: $isin}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
      id
    }
  }
`);

export const createBond = action
  .schema(CreateBondSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        isin,
        cap,
        faceValue,
        maturityDate,
        underlyingAsset,
      },
      ctx: { user },
    }) => {
      const capExact = parseEther(cap, decimals);
      const maturityDateTimestamp = formatDate(maturityDate, {
        type: "unixSeconds",
      });

      const predictedAddress = await portalClient.request(
        CreateBondPredictAddress,
        {
          address: BOND_FACTORY_ADDRESS,
          sender: user.wallet,
          decimals,
          cap: capExact,
          faceValue,
          maturityDate: maturityDateTimestamp,
          underlyingAsset,
          name: assetName,
          symbol,
        }
      );

      const newAddress =
        predictedAddress.BondFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error("Failed to predict the address");
      }

      await hasuraClient.request(CreateOffchainBond, {
        id: newAddress,
        isin: isin,
      });

      const data = await portalClient.request(BondFactoryCreate, {
        address: BOND_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        cap: capExact,
        faceValue,
        maturityDate: maturityDateTimestamp,
        underlyingAsset,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([data.BondFactoryCreate?.transactionHash]);
    }
  );
