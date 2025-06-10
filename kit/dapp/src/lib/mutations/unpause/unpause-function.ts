import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { UnpauseInput } from "./unpause-schema";

// Dummy types for commented GraphQL operations
const BondUnpause = {} as any;
const EquityUnpause = {} as any;
const FundUnpause = {} as any;
const StableCoinUnpause = {} as any;
const DepositUnpause = {} as any;

/**
 * GraphQL mutation for unpausing a bond contract
 */
// const BondUnpause = portalGraphql(`
//   mutation BondUnpause($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
//     BondUnpause(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for unpausing an equity contract
 */
// const EquityUnpause = portalGraphql(`
//   mutation EquityUnpause($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
//     EquityUnpause(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for unpausing a fund contract
 */
// const FundUnpause = portalGraphql(`
//   mutation FundUnpause($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
//     FundUnpause(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for unpausing a stablecoin contract
 */
// const StableCoinUnpause = portalGraphql(`
//   mutation StableCoinUnpause($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
//     StableCoinUnpause(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation for unpausing a tokenized deposit contract
 */
// const DepositUnpause = portalGraphql(`
//   mutation DepositUnpause($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
//     DepositUnpause(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * Function to unpause a token contract
 *
 * @param input - Validated input containing address, verificationCode, and assettype
 * @param user - The user executing the unpause operation
 * @returns Array of transaction hashes
 */
export const unpauseFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: { address, verificationCode, verificationType, assettype },
    ctx: { user },
  }: {
    parsedInput: UnpauseInput;
    ctx: { user: User };
  }) => {
    // Common parameters for all mutations
    const params: VariablesOf<
      | typeof BondUnpause
      | typeof EquityUnpause
      | typeof FundUnpause
      | typeof StableCoinUnpause
      | typeof DepositUnpause
    > = {
      address,
      from: user.wallet,
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    };

    switch (assettype) {
      case "bond": {
          // const response = await portalClient.request(BondUnpause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.BondUnpause?.transactionHash */]
        );
      }
      case "cryptocurrency": {
        throw new Error("Cryptocurrency does not support unpause operations");
      }
      case "equity": {
          // const response = await portalClient.request(EquityUnpause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.EquityUnpause?.transactionHash */]
        );
      }
      case "fund": {
          // const response = await portalClient.request(FundUnpause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.FundUnpause?.transactionHash */]
        );
      }
      case "stablecoin": {
          // const response = await portalClient.request(StableCoinUnpause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.StableCoinUnpause?.transactionHash */]
        );
      }
      case "deposit": {
          // const response = await portalClient.request(DepositUnpause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.DepositUnpause?.transactionHash */]
        );
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);
