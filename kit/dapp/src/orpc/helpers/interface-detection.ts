import { ALL_INTERFACE_IDS, type InterfaceId } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

/**
 * GraphQL query to check if a contract supports a specific interface
 */
const SUPPORTS_INTERFACE_QUERY = portalGraphql(`
  query SupportsInterface($address: String!, $interfaceId: String!) {
    supports: ISMART(
      address: $address
    ) {
      supportsInterface( interfaceId: $interfaceId)
    }
  }
`);

/**
 * Check if a token contract supports a specific interface using ERC165
 * @param client - The portal GraphQL client
 * @param tokenAddress - The address of the token contract
 * @param interfaceId - The 4-byte interface ID to check
 * @returns true if the interface is supported, false otherwise
 */
export async function supportsInterface(
  client: ValidatedPortalClient,
  tokenAddress: string,
  interfaceId: string
): Promise<boolean> {
  try {
    const result = await client.query(
      SUPPORTS_INTERFACE_QUERY,
      {
        address: tokenAddress,
        interfaceId,
      },
      z.object({
        supports: z.boolean(),
      }),
      "Failed to check interface support"
    );

    return !!result.supports;
  } catch {
    // If the contract doesn't implement ERC165, it will throw
    // In that case, we assume it doesn't support the interface
    return false;
  }
}

/**
 * Validate that a token supports a required interface and throw an error if not
 * @param client - The portal GraphQL client
 * @param tokenAddress - The address of the token contract
 * @param requiredInterface - The name of the required interface
 * @param action - The action being attempted (for error messaging)
 * @throws ORPCError if the interface is not supported
 */
export async function validateTokenCapability(
  client: ValidatedPortalClient,
  tokenAddress: string,
  requiredInterface: InterfaceId,
  action: string
): Promise<void> {
  const interfaceId = ALL_INTERFACE_IDS[requiredInterface];
  const supported = await supportsInterface(client, tokenAddress, interfaceId);

  if (!supported) {
    throw new ORPCError("BAD_REQUEST", {
      message: `Token does not support ${action}. The token contract must implement ${requiredInterface}.`,
      data: {
        tokenAddress,
        action,
        requiredInterface,
        interfaceId,
      },
    });
  }
}

/**
 * Token capabilities that can be detected via ERC165
 */
export interface TokenCapabilities {
  // Standard interfaces
  erc165: boolean;
  erc20: boolean;
  erc3643: boolean;

  // SMART protocol extensions
  burnable: boolean;
  custodian: boolean;
  redeemable: boolean;
  capped: boolean;
  collateral: boolean;
  yield: boolean;
  pausable: boolean;
}

/**
 * Get all capabilities of a token by checking multiple interfaces
 * @param client - The portal GraphQL client
 * @param tokenAddress - The address of the token contract
 * @returns Object indicating which interfaces are supported
 */
export async function getTokenCapabilities(
  client: ValidatedPortalClient,
  tokenAddress: string
): Promise<TokenCapabilities> {
  // Check all interfaces in parallel for better performance
  const [
    erc165,
    erc20,
    erc3643,
    burnable,
    custodian,
    redeemable,
    capped,
    collateral,
    yieldSupport,
    pausable,
  ] = await Promise.all([
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.IERC165),
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.IERC20),
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.IERC3643),
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.ISMARTBurnable),
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.ISMARTCustodian),
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.ISMARTRedeemable),
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.ISMARTCapped),
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.ISMARTCollateral),
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.ISMARTYield),
    supportsInterface(client, tokenAddress, ALL_INTERFACE_IDS.ISMARTPausable),
  ]);

  return {
    erc165,
    erc20,
    erc3643,
    burnable,
    custodian,
    redeemable,
    capped,
    collateral,
    yield: yieldSupport,
    pausable,
  };
}

/**
 * Interface priority for operations that could be handled by multiple interfaces
 * Lower number = higher priority
 */
export const INTERFACE_PRIORITY: Record<string, Record<string, number>> = {
  burn: {
    ISMARTBurnable: 1,
    IERC3643: 2,
  },
  transfer: {
    IERC20: 1, // For regular transfers
    IERC3643: 2,
  },
  forcedTransfer: {
    ISMARTCustodian: 1,
    IERC3643: 2,
  },
  freeze: {
    ISMARTCustodian: 1,
    IERC3643: 2,
  },
  pause: {
    ISMARTPausable: 1,
    IERC3643: 2,
  },
};

/**
 * Get the best interface to use for a specific operation
 * @param capabilities - The token's capabilities
 * @param operation - The operation to perform (e.g., "burn", "transfer", "freeze")
 * @returns The best interface to use, or null if none available
 */
export function getBestInterfaceForOperation(
  capabilities: TokenCapabilities,
  operation: string
): InterfaceId | null {
  switch (operation) {
    case "burn":
      if (capabilities.burnable) return "ISMARTBurnable";
      if (capabilities.erc3643) return "IERC3643";
      return null;

    case "transfer":
    case "transferFrom":
      if (capabilities.erc20) return "IERC20";
      if (capabilities.erc3643) return "IERC3643";
      return null;

    case "forcedTransfer":
      if (capabilities.custodian) return "ISMARTCustodian";
      return null;

    case "freeze":
    case "unfreeze":
      if (capabilities.custodian) return "ISMARTCustodian";
      if (capabilities.erc3643) return "IERC3643";
      return null;

    case "redeem":
      if (capabilities.redeemable) return "ISMARTRedeemable";
      return null;

    case "setCap":
      if (capabilities.capped) return "ISMARTCapped";
      return null;

    case "setYield":
      if (capabilities.yield) return "ISMARTYield";
      return null;

    case "pause":
    case "unpause":
      if (capabilities.pausable) return "ISMARTPausable";
      if (capabilities.erc3643) return "IERC3643";
      return null;

    default:
      return null;
  }
}
