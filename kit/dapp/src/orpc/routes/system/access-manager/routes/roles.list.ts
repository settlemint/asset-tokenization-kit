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

    const roles = Object.entries(systemRoles).reduce<SystemRolesOutput>(
      (acc, [role, accounts]) => {
        accounts.forEach((account) => {
          if (excludeContracts && account.isContract) {
            return acc;
          }
          const accountAddress = getEthereumAddress(account.id);
          const existingAccount = acc.find((a) => a.account === accountAddress);
          if (existingAccount) {
            existingAccount.roles.push(role as AccessControlRoles);
          } else {
            acc.push({
              roles: [role as AccessControlRoles],
              account: accountAddress,
            });
          }
          return acc;
        });
        return acc;
      },
      []
    );

    return SystemRolesOutputSchema.parse(roles);
  });
