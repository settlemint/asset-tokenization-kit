import { bc } from "@/lib/orpc/routes/procedures/base.contract";
import { oo } from "@orpc/openapi";

export const ac = bc.errors({
  UNAUTHORIZED: oo.spec(
    {
      message: "Authentication missing or failed",
    },
    {
      security: [{ apiKey: [] }],
    }
  ),
});
