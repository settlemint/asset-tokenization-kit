import { baseContract } from "@/orpc/procedures/base.contract";
import {
  SystemRolesInputSchema,
  SystemRolesOutputSchema,
} from "./roles.list.schema";

const TAGS = ["access-manager"];

export const rolesListContract = baseContract
  .route({
    method: "GET",
    path: "/system/access-manager/roles",
    description: "List all accounts and their roles",
    successDescription: "List of all accounts and their roles",
    tags: TAGS,
  })
  .input(SystemRolesInputSchema)
  .output(SystemRolesOutputSchema);
