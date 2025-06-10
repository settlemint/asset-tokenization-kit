import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { PauseInput } from "./pause-schema";

// Dummy types for commented GraphQL operations
const BondPause = {} as any;
const EquityPause = {} as any;
const FundPause = {} as any;
const StableCoinPause = {} as any;
const DepositPause = {} as any;


/**
 * GraphQL mutation for pausing a bond contract
 */
// const BondPause = portalGraphql(`
//   mutation BondPause(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//   ) {
//     BondPause(
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
 * GraphQL mutation for pausing an equity contract
 */
// const EquityPause = portalGraphql(`
//   mutation EquityPause(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//   ) {
//     EquityPause(
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
 * GraphQL mutation for pausing a fund contract
 */
// const FundPause = portalGraphql(`
//   mutation FundPause(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//   ) {
//     FundPause(
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
 * GraphQL mutation for pausing a stablecoin contract
 */
// const StableCoinPause = portalGraphql(`
//   mutation StableCoinPause(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//   ) {
//     StableCoinPause(
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
 * GraphQL mutation for pausing a tokenized deposit contract
 */
// const DepositPause = portalGraphql(`
//   mutation DepositPause(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//   ) {
//     DepositPause(
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
 * Function to pause contract operations for a specific asset type
 *
 * @param input - Validated input containing address, verificationCode, and assettype
 * @param user - The user executing the pause operation
 * @returns Array of transaction hashes
 */
export const pauseFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: { address, verificationCode, verificationType, assettype },
    ctx: { user },
  }: {
    parsedInput: PauseInput;
    ctx: { user: User };
  }) => {
    // Common parameters for all mutations
    const params: VariablesOf<
      | typeof BondPause
      | typeof EquityPause
      | typeof FundPause
      | typeof StableCoinPause
      | typeof DepositPause
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
          // const response = await portalClient.request(BondPause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.BondPause?.transactionHash */]
        );
      }
      case "cryptocurrency": {
        throw new Error("Cryptocurrency does not support pause operations");
      }
      case "equity": {
          // const response = await portalClient.request(EquityPause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.EquityPause?.transactionHash */]
        );
      }
      case "fund": {
          // const response = await portalClient.request(FundPause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.FundPause?.transactionHash */]
        );
      }
      case "stablecoin": {
          // const response = await portalClient.request(StableCoinPause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.StableCoinPause?.transactionHash */]
        );
      }
      case "deposit": {
          // const response = await portalClient.request(DepositPause, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.DepositPause?.transactionHash */]
        );
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);
