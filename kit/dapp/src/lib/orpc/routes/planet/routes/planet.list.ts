import { ar } from "@/lib/orpc/routes/procedures/auth.router";

export const list = ar.planet.list.handler(async ({ input, context }) => {
  // your list code here
  return [{ id: "xx", name: "name" }];
});
