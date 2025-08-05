import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import {
  SystemRolesOutput,
  SystemRolesOutputSchema,
} from "@/orpc/routes/system/access-manager/routes/roles.list.schema";

export const rolesList = onboardedRouter.system.rolesList
  .use(systemMiddleware)
  .handler(({ input, context }) => {
    const { excludeContracts } = input;
    const { system } = context;

    const systemRoles = system.systemAccessManager?.accessControl;

    if (!systemRoles) {
      return [];
    }

    const rolesByAccount = new Map<string, SystemRolesOutput[number]>();

    for (const [role, accounts] of Object.entries(systemRoles)) {
      for (const account of accounts) {
        if (excludeContracts && account.isContract) {
          continue;
        }
        const accountAddress = getEthereumAddress(account.id);
        const existingAccount = rolesByAccount.get(accountAddress);

        if (existingAccount) {
          existingAccount.roles.push(role as AccessControlRoles);
        } else {
          rolesByAccount.set(accountAddress, {
            roles: [role as AccessControlRoles],
            account: accountAddress,
          });
        }
      }
    }

    return SystemRolesOutputSchema.parse([...rolesByAccount.values()]);
  });
