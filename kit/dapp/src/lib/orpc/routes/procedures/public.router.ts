import { sessionMiddleware } from "../../middlewares/auth/session.middleware";
import { errorMiddleware } from "../../middlewares/errors/error.middleware";
import { br } from "./base.router";

export const pr = br.use(errorMiddleware).use(sessionMiddleware);
