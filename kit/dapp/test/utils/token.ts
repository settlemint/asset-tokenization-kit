import { retryWhenFailed } from "@settlemint/sdk-utils";
import { randomUUID } from "node:crypto";
import { OrpcClient } from "./orpc-client";

type TokenInput = Parameters<OrpcClient["token"]["create"]>[0];

export async function createToken(orpClient: OrpcClient, input: TokenInput) {
  const name = `${input.name} ${randomUUID()}`;
  const result = await orpClient.token.create({
    ...input,
    name,
  });
  let isDeployed = false;
  for await (const event of result) {
    if (event.status !== "confirmed") {
      continue;
    }
    if (event.result && event.tokenType) {
      // First deploy
      isDeployed = true;
    }
  }
  if (!isDeployed) {
    throw new Error("Token not deployed");
  }
  return retryWhenFailed(
    async () => {
      const tokens = await orpClient.token.list({});
      const token = tokens.find(
        (t) =>
          t.name === name && t.symbol === input.symbol && t.type === input.type
      );
      if (!token) {
        throw new Error("Token not found");
      }
      return token;
    },
    3,
    3_000
  );
}
