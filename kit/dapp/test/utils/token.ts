import { retryWhenFailed } from "@settlemint/sdk-utils";
import { randomUUID } from "node:crypto";
import { OrpcClient } from "./orpc-client";

type TokenInput = Parameters<OrpcClient["token"]["create"]>[0];

export async function createToken(orpClient: OrpcClient, input: TokenInput) {
  const name = `${input.name} ${randomUUID()}`;
  await orpClient.token.create({
    ...input,
    name,
  });
  return retryWhenFailed(
    async () => {
      const tokens = await orpClient.token.list({});
      const token = tokens.find(
        (t) =>
          t.name === input.name &&
          t.symbol === input.symbol &&
          t.type === input.type
      );
      if (!token) {
        throw new Error("Token not deployed");
      }
      return token;
    },
    3,
    3_000
  );
}
