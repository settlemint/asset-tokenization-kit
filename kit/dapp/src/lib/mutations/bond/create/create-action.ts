"use server";

import { handleChallenge } from "@/lib/challenge";
import { BOND_FACTORY_ADDRESS } from "@/lib/contracts";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
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
 * GraphQL mutation for creating off-chain metadata for a bond
 *
 * @remarks
 * Stores additional metadata about the bond in Hasura
 */
const CreateOffchainBond = hasuraGraphql(`
  mutation CreateOffchainBond($id: String!, $isin: String, $value_in_base_currency: numeric) {
    insert_asset_one(object: {id: $id, isin: $isin, value_in_base_currency: $value_in_base_currency}) {
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
        predictedAddress,
        valueInBaseCurrency,
      },
      ctx: { user },
    }) => {
      const capExact = String(parseUnits(String(cap), decimals));
      const maturityDateTimestamp = formatDate(maturityDate, {
        type: "unixSeconds",
        locale: "en",
      });

      await hasuraClient.request(CreateOffchainBond, {
        id: predictedAddress,
        isin: isin,
        value_in_base_currency: String(valueInBaseCurrency),
      });

      const data = await portalClient.request(BondFactoryCreate, {
        address: BOND_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        cap: capExact,
        faceValue: String(faceValue),
        maturityDate: maturityDateTimestamp,
        underlyingAsset: underlyingAsset.id,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return safeParseTransactionHash([
        data.BondFactoryCreate?.transactionHash,
      ]);
    }
  );
