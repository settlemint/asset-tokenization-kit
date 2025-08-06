import { randomUUID } from "node:crypto";
import { OrpcClient } from "./orpc-client";

type TokenInput = Parameters<OrpcClient["token"]["create"]>[0];

export async function createToken(orpClient: OrpcClient, input: TokenInput) {
  const name = `${input.name} ${randomUUID()}`;

  const payload = {
    ...input,
    name,
  };

  console.log("Creating token with payload:", JSON.stringify(payload, null, 2));

  try {
    const result = await orpClient.token.create(payload);

    // The create method now returns the token object directly
    if (!result || !result.id || !result.type) {
      throw new Error("Token not deployed");
    }

    return result;
  } catch (error) {
    console.error("Token creation failed with error:", error);
    console.error("Failed payload was:", JSON.stringify(payload, null, 2));
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}
