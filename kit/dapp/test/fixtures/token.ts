import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { DEFAULT_PINCODE } from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { OrpcClient } from "./orpc-client";

type TokenInput = Parameters<OrpcClient["token"]["create"]>[0];

export async function createToken(
  orpClient: OrpcClient,
  input: TokenInput,
  rolesToGrant: AccessControlRoles[] = []
) {
  // Truncate the base name to ensure total length with UUID doesn't exceed 50 chars
  // UUID is 36 chars + 1 space = 37 chars, so max base name is 13 chars
  const baseName = input.name.slice(0, 13);
  const name = `${baseName} ${randomUUID()}`;

  const payload = {
    ...input,
    name,
  };

  const result = await orpClient.token.create(payload);

  // The create method now returns the token object directly
  if (!result || !result.id || !result.type) {
    throw new Error("Token not deployed");
  }

  if (rolesToGrant.length > 0) {
    const me = await orpClient.user.me({});
    await orpClient.token.grantRole({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      contract: result.id,
      address: me.wallet ?? "",
      roles: rolesToGrant,
    });
  }

  return result;
}
