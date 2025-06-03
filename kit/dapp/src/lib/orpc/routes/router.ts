import planetRouter from "./planet/planet.router";
import { pr } from "./procedures/public.router";

export const router = pr.router({
  planet: planetRouter,
});
