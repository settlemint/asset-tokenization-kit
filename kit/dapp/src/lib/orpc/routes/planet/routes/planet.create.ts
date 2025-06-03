import { ar } from "../../procedures/auth.router";

export const create = ar.planet.create.handler(async ({ input, context }) => {
  const user = context.auth.user;
  const _db = context.db;
  // your create code here
  return { id: user.id, name: user.name };
});
