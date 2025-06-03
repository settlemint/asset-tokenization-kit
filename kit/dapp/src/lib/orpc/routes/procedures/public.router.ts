import { session } from "../../middlewares/auth/session.middleware";
import { br } from "./base.router";

export const pr = br.use(session);
