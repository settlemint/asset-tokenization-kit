"use server";

import { handleChallenge } from "@/lib/challenge";
import { getRoleIdentifier, type Role } from "@/lib/config/roles";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { RevokeRoleSchema } from "./revoke-role-schema";

/**
 * GraphQL mutation for revoking a role from a user for a stablecoin
 *
 * @remarks
 * Removes permissions from an account for interacting with the stablecoin
 */
const RevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $from: String!, $challengeResponse: String!, $input: StableCoinRevokeRoleInput!) {
    StableCoinRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const revokeRole = action
  .schema(RevokeRoleSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, roles, userAddress, pincode },
      ctx: { user },
    }) => {
      const selectedRoles = Object.entries(roles)
        .filter(([, enabled]) => enabled)
        .map(([role]) => role as Role);

      // Create an array of promises for each role revocation request
      const revokePromises = selectedRoles.map(async (role) => {
        const response = await portalClient.request(RevokeRole, {
          address: address,
          from: user.wallet,
          input: {
            role: getRoleIdentifier(role),
            account: userAddress,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
        });

        return response.StableCoinRevokeRole?.transactionHash;
      });

      // Execute all requests in parallel
      const results = await Promise.all(revokePromises);

      // Filter out any undefined values and return transaction hashes
      const transactions = results.filter(Boolean) as string[];

      return z.hashes().parse(transactions);
    }
  );
