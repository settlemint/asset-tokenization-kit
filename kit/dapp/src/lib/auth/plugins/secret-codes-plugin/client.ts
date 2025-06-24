import type { BetterAuthClientPlugin } from "better-auth/types";
import type { secretCodes } from "./index";

export const secretCodesClient = () => {
  return {
    id: "secret-codes",
    $InferServerPlugin: {} as ReturnType<typeof secretCodes>,
    atomListeners: [
      {
        matcher: (path) => path.startsWith("/secret-codes/"),
        signal: "$sessionSignal",
      },
    ],
  } satisfies BetterAuthClientPlugin;
};
