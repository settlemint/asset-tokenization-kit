import { br } from "./procedures/base.router";

export const router = br.router({
  planet: br.planet.lazy(() => import("./planet/planet.router")),
});
