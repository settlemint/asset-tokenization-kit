import { randomUUID } from "node:crypto";
import { OrpcClient } from "./orpc-client";

type TokenInput = Parameters<OrpcClient["token"]["create"]>[0];

export async function createToken(orpClient: OrpcClient, input: TokenInput) {
  const name = `${input.name} ${randomUUID()}`;

  const result = await orpClient.token.create({
    ...input,
    name,
  });

  // The create method now returns the token object directly
  if (!result || !result.id || !result.type) {
    throw new Error("Token not deployed");
  }

  return result;
}
