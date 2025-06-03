import { pr } from "./procedures/public.router";

export const router = pr.router({
  planet: pr.planet.lazy(() => import("./planet/planet.router")),
});
