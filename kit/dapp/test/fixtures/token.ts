import { AccessControlRole } from "@atk/zod/src/access-control-roles";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { DEFAULT_PINCODE } from "@test/fixtures/user";
import { randomUUID } from "node:crypto";
import { OrpcClient } from "./orpc-client";

type TokenInput = Parameters<OrpcClient["token"]["create"]>[0];

type TokenActions = {
  grantRole?: AccessControlRole | AccessControlRole[];
  unpause?: boolean;
};

const logger = createLogger({ level: "info" });
export async function createToken(
  orpClient: OrpcClient,
  input: TokenInput,
  actions: TokenActions = {}
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

  const { grantRole, unpause } = actions;

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
    const grantRoleResult = await orpClient.token.grantRole({
      walletVerification: {
        secretVerificationCode: DEFAULT_PINCODE,
        verificationType: "PINCODE",
      },
      contract: result.id,
      address: me.wallet ?? "",
      roles: rolesToGrant,
    });

    logger.info("Granted roles to token", {
      token: result.id,
      roles: rolesToGrant,
      grantRoleResult,
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
    logger.info("Unpaused token", {
      token: result.id,
    });
  }

  return result;
}
