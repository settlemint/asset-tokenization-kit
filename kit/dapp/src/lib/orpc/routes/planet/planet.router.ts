import { ar } from "@/lib/orpc/routes/procedures/authenticated.router";

const create = ar.planet.create.handler(async ({ input, context }) => {
  const user = context.auth.user;
  // your create code here
  return { id: user.id, name: user.name };
});

const find = ar.planet.find.handler(async ({ input }) => {
  // your find code here
  return { id: "xxx", name: "name" };
});

const list = ar.planet.list.handler(async ({ input }) => {
  // your list code here
  return [{ id: "xx", name: "name" }];
});

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  list,
  find,
  create,
};
