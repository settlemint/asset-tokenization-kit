import { createSafeActionClient } from "next-safe-action";

class ActionServerError extends Error {}

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message);
    return e.message;
  },
});
