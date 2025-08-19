import { getEthereumAddress } from "@atk/zod/validators/ethereum-address";
import { getAccessControlEntries } from "@/helpers/access-control-helpers";
import { systemMiddleware } from "@/middlewares/system/system.middleware";
import { onboardedRouter } from "@/procedures/onboarded.router";
import {
  type SystemRolesOutput,
  SystemRolesOutputSchema,
} from "@/routes/system/access-manager/routes/roles.list.schema";

export const rolesList = onboardedRouter.system.rolesList.use(systemMiddleware).handler(({ input, context }) => {
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
