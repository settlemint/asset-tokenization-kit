import type { BetterAuthClientPlugin } from "better-auth/types";
import type { pincode } from "./server";

export const pincodeClient = () => {
  return {
    id: "pincode",
    $InferServerPlugin: {} as ReturnType<typeof pincode>,
    atomListeners: [
      {
        matcher: (path) => path.startsWith("/pincode/"),
        signal: "$sessionSignal",
      },
    ],
  } satisfies BetterAuthClientPlugin;
};
