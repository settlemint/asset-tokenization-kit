import { getAccessControlEntries } from "@/orpc/helpers/access-control-helpers";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  type SystemRolesOutput,
  SystemRolesOutputSchema,
} from "@/orpc/routes/system/access-manager/routes/roles.list.schema";
import { getEthereumAddress } from "@atk/zod/ethereum-address";

export const rolesList = systemRouter.system.rolesList
  .handler(({ input, context }) => {
    const { excludeContracts } = input;
    const { system } = context;

    const systemRoles = system.systemAccessManager?.accessControl;

    if (!systemRoles) {
      return [];
    }

    const rolesByAccount = new Map<string, SystemRolesOutput[number]>();

    for (const [role, accounts] of getAccessControlEntries(systemRoles)) {
      for (const account of accounts) {
        if (excludeContracts && account.isContract) {
          continue;
        }
        const accountAddress = getEthereumAddress(account.id);
        const existingAccount = rolesByAccount.get(accountAddress);

        if (existingAccount) {
          existingAccount.roles.push(role);
        } else {
          rolesByAccount.set(accountAddress, {
            roles: [role],
            account: accountAddress,
          });
        }
      }
    }

    return SystemRolesOutputSchema.parse([...rolesByAccount.values()]);
  });
