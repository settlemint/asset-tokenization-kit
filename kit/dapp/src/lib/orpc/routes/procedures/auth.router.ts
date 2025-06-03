import { pr } from "@/lib/orpc/routes/procedures/public.router";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";

export const ar = pr.use(authMiddleware);
