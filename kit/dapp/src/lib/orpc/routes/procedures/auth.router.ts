import { pr } from "@/lib/orpc/routes/procedures/public.router";
import { auth } from "../../middlewares/auth/auth.middleware";

export const ar = pr.use(auth);
