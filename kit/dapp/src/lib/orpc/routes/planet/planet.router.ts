import type { auth } from "@/lib/auth/auth";
import { implement } from "@orpc/server";
import { planetContract } from "./planet.contract";

const os = implement(planetContract).$context<{
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
}>();

export const create = os.create.handler(async ({ input, context }) => {
  // your create code here
  return { id: "xxx", name: "name" };
});

export const find = os.find.handler(async ({ input }) => {
  // your find code here
  return { id: "xxx", name: "name" };
});

export const list = os.list.handler(async ({ input }) => {
  // your list code here
  return [{ id: "xx", name: "name" }];
});

export const planetRouter = os.router({
  list,
  find,
  create,
});
