import { AccessControlRole } from "@atk/zod/access-control-roles";
import { DEFAULT_PINCODE } from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { OrpcClient } from "./orpc-client";

type TokenInput = Parameters<OrpcClient["token"]["create"]>[0];

type TokenOptions = {
  useExactName?: boolean;
  grantRole?: AccessControlRole | AccessControlRole[];
  unpause?: boolean;
};

export async function createToken(
  orpClient: OrpcClient,
  input: TokenInput,
  options: TokenOptions = {}
) {
  // Truncate the base name to ensure total length with UUID doesn't exceed 50 chars
  // UUID is 36 chars + 1 space = 37 chars, so max base name is 13 chars
  const baseName = input.name.slice(0, 13);
  const name = `${baseName} ${randomUUID()}`;

  const payload = {
    ...input,
    name: options.useExactName === true ? input.name : name,
  };

  if (options.useExactName === true) {
    const searchResults = await orpClient.token.search({ query: payload.name });
    const existingToken = searchResults.find(
      (t) => t.name === payload.name && t.symbol === payload.symbol
    );
    if (existingToken) {
      return orpClient.token.read({ tokenAddress: existingToken.id });
    }
  }

  const result = await orpClient.token.create(payload);

  // The create method now returns the token object directly
  if (!result || !result.id || !result.type) {
    throw new Error("Token not deployed");
  }

  const { grantRole, unpause } = options;

  let rolesToGrant: AccessControlRole[] = grantRole
    ? Array.isArray(grantRole)
      ? grantRole
      : [grantRole]
    : [];

  if (unpause) {
    rolesToGrant = Array.from(new Set([...rolesToGrant, "emergency"]));
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

  if (unpause) {
    await orpClient.token.unpause({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      contract: result.id,
    });
  }

  return result;
}
