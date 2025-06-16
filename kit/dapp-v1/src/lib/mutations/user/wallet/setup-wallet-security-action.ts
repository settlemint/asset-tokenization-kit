"use server";

import { t } from "@/lib/utils/typebox";
import { action } from "../../safe-action";
import { setupWalletSecurityFunction } from "./setup-wallet-security-function";
import { SetupWalletSecuritySchema } from "./setup-wallet-security-schema";

export const setupWalletSecurity = action
  .schema(SetupWalletSecuritySchema())
  .outputSchema(t.Object({ success: t.Boolean() }))
  .action(setupWalletSecurityFunction);
