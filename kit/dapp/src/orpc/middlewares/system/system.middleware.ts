import { AccessControlFragment } from "@/lib/fragments/the-graph/access-control-fragment";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { Context } from "@/orpc/context/context";
import { mapUserRoles } from "@/orpc/helpers/role-validation";
import type { ValidatedTheGraphClient } from "@/orpc/middlewares/services/the-graph.middleware";
import { baseRouter } from "@/orpc/procedures/base.router";
import { read } from "@/orpc/routes/settings/routes/settings.read";
import {
  SystemSchema,
  type System,
} from "@/orpc/routes/system/routes/system.read.schema";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { AccessControlRoles } from "@atk/zod/access-control-roles";
import { satisfiesRoleRequirement } from "@atk/zod/role-requirement";
import { call } from "@orpc/server";
import { createLogger } from "@settlemint/sdk-utils/logging";
import countries from "i18n-iso-countries";
import { isAddress } from "viem";
import * as z from "zod";

const SYSTEM_QUERY = theGraphGraphql(
  `
  query GetSystem($systemAddress: ID!, $userAddress: String!) {
    system(id: $systemAddress) {
      id
      deployedInTransaction
      systemAccessManager {
        id
        accessControl {
          ...AccessControlFragment
        }
      }
      tokenFactoryRegistry {
        id
        tokenFactories {
          id
          name
          typeId
        }
      }
      complianceModuleRegistry {
        id
        complianceModules {
          id
          typeId
          name
        }
      }
      identityFactory {
        id
        identities(where: { account: $userAddress }) {
          id
        }
      }
      identityRegistryStorage {
        id
        registeredIdentities(where: { account: $userAddress }) {
          id
          country
        }
      }
      identityRegistry {
        id
      }
      trustedIssuersRegistry {
        id
      }
      topicSchemeRegistry {
        id
      }
      systemAddonRegistry {
        id
        systemAddons {
          id
          name
          typeId
        }
      }
    }
  }
`,
  [AccessControlFragment]
);

const logger = createLogger();

/**
 * Middleware to inject the system context into the request context.
 * @returns The middleware function.
 */
export const systemMiddleware = baseRouter.middleware<
  Required<Pick<Context, "system">>,
  unknown
>(async ({ context, next, errors }, input) => {
  const { auth, theGraphClient } = context;

  if (!auth?.user.wallet) {
    logger.warn("sessionMiddleware should be called before systemMiddleware");
    throw errors.UNAUTHORIZED({
      message: "Authentication required to access system information",
    });
  }

  if (!theGraphClient) {
    throw errors.INTERNAL_SERVER_ERROR({
      message: "theGraphMiddleware should be called before systemMiddleware",
    });
  }

  // Always fetch fresh system data - no caching
  const systemAddress = await getSystemAddress(context, input);
  if (!systemAddress) {
    throw errors.SYSTEM_NOT_CREATED();
  }

  const { system } = await theGraphClient.query(SYSTEM_QUERY, {
    input: {
      systemAddress,
      userAddress: auth.user.wallet.toLowerCase(),
    },
    output: z.object({ system: SystemSchema }),
  });

  if (!system) {
    throw errors.NOT_FOUND({
      message: `System with address '${systemAddress}' not found`,
    });
  }

  const userRoles = mapUserRoles(
    auth.user.wallet,
    system.systemAccessManager.accessControl
  );

  // Process user identity data
  const userIdentity = system.identityFactory.identities?.[0];
  const registeredIdentity =
    system.identityRegistryStorage.registeredIdentities?.[0];

  const systemInfo: System = {
    ...system,
    userPermissions: {
      roles: userRoles,
      actions: getSystemPermissions(userRoles),
    },
    userIdentity: userIdentity
      ? {
          address: userIdentity.id,
          registered: registeredIdentity
            ? {
                isRegistered: true,
                country:
                  countries.numericToAlpha2(registeredIdentity?.country) ?? "",
              }
            : undefined,
        }
      : undefined,
  };

  const systemContext = SystemSchema.parse(systemInfo);

  return next({
    context: {
      system: systemContext,
    },
  });
});

/**
 * Get the system address based on request context and input.
 *
 * Precedence:
 * 1) Header: `x-system-address`
 * 2) Input: if `input` is an object with an `id` field
 * 3) Default: value from settings (SYSTEM_ADDRESS)
 *
 * @param context - The ORPC request context
 * @param input - The procedure input
 * @returns The resolved system address string, or null if unavailable
 */
async function getSystemAddress(
  context: Context,
  input: unknown
): Promise<string | null> {
  const headerValue = context.headers["x-system-address"];
  const systemAddressHeader = Array.isArray(headerValue)
    ? headerValue[0]
    : headerValue;

  if (typeof systemAddressHeader === "string" && systemAddressHeader) {
    return systemAddressHeader;
  }

  if (input && typeof input === "object" && "id" in input) {
    const maybeId = (input as Record<string, unknown>).id;
    const maybeEthereumAddress =
      maybeId && typeof maybeId === "string" && isAddress(maybeId)
        ? maybeId
        : null;
    if (maybeEthereumAddress) {
      return maybeEthereumAddress;
    }
  }

  const defaultAddress = await call(
    read,
    {
      key: "SYSTEM_ADDRESS" as const,
    },
    { context }
  ).catch(() => null);

  return defaultAddress;
}

/**
 * Fetch system context directly from TheGraph
 *
 * Exposed for routes that need on-demand system reads without applying the middleware.
 */
export async function getSystemContext(
  systemAddress: string,
  theGraphClient: ValidatedTheGraphClient,
  userAddress: string
) {
  const { system } = await theGraphClient.query(SYSTEM_QUERY, {
    input: {
      systemAddress,
      userAddress: userAddress.toLowerCase(),
    },
    output: z.object({ system: SystemSchema }),
  });
  return system;
}

export function getSystemPermissions(
  userRoles: ReturnType<typeof mapUserRoles>
) {
  // Initialize all actions as false, allowing TypeScript to infer the precise type
  const initialActions: Record<keyof typeof SYSTEM_PERMISSIONS, boolean> = {
    accountSearch: false,
    addonCreate: false,
    addonFactoryCreate: false,
    claimCreate: false,
    claimList: false,
    claimRevoke: false,
    complianceModuleCreate: false,
    grantRole: false,
    identityCreate: false,
    identityRead: false,
    identitySearch: false,
    identityList: false,
    entityList: false,
    identityRegister: false,
    kycDelete: false,
    kycList: false,
    kycRead: false,
    kycUpsert: false,
    revokeRole: false,
    tokenCreate: false,
    tokenFactoryCreate: false,
    topicCreate: false,
    topicDelete: false,
    topicUpdate: false,
    trustedIssuerCreate: false,
    trustedIssuerDelete: false,
    trustedIssuerUpdate: false,
    userList: false,
    userRead: false,
    userSearch: false,
  };

  const userRoleList = Object.entries(userRoles)
    .filter(([, hasRole]) => hasRole)
    .map(([role]) => role) as AccessControlRoles[];

  // Update based on user roles using the flexible role requirement system
  Object.entries(SYSTEM_PERMISSIONS).forEach(([action, roleRequirement]) => {
    if (action in initialActions) {
      initialActions[action as keyof typeof initialActions] =
        satisfiesRoleRequirement(userRoleList, roleRequirement);
    }
  });
  return initialActions;
}
