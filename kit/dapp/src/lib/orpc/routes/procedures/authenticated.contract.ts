import { pc } from "@/lib/orpc/routes/procedures/public.contract";
import { oo } from "@orpc/openapi";

export const ac = pc.errors({
  UNAUTHORIZED: oo.spec(
    {
      message: "Unauthorized",
    },
    {
      security: [{ apiKey: [] }],
    }
  ),
});
