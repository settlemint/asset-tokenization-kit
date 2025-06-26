import type { BetterAuthClientPlugin } from "better-auth/types";
import type { wallet } from "./index";

export const walletClient = () => {
  return {
    id: "wallet",
    $InferServerPlugin: {} as ReturnType<typeof wallet>,
    atomListeners: [
      {
        matcher: (path) => path.startsWith("/wallet/"),
        signal: "$sessionSignal",
      },
    ],
  } satisfies BetterAuthClientPlugin;
};
