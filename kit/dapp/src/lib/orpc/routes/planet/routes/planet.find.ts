import { ar } from "@/lib/orpc/routes/procedures/auth.router";

export const find = ar.planet.find.handler(async ({ input }) => {
  // your find code here
  return { id: "xxx", name: "name" };
});
