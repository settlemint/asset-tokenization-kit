import type { BetterAuthClientPlugin } from "better-auth/types";
import type { twoFactor } from "./index";

export const twoFactorClient = () => {
  return {
    id: "two-factor",
    $InferServerPlugin: {} as ReturnType<typeof twoFactor>,
    atomListeners: [
      {
        matcher: (path) => path.startsWith("/two-factor/"),
        signal: "$sessionSignal",
      },
    ],
  } satisfies BetterAuthClientPlugin;
};
