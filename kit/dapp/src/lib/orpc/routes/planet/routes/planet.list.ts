import { ar } from "@/lib/orpc/routes/procedures/auth.router";

export const list = ar.planet.list.handler(async ({ input, context }) => {
  // your list code here
  return [
    { id: "xx", name: "name" },
    { id: "xxx", name: "name 2" },
    { id: "xxxx", name: "name 3" },
    { id: "xxxxx", name: "name 4" },
    { id: "xxxxxx", name: "name 5" },
    { id: "xxxxxxx", name: "name 6" },
    { id: "xxxxxxxx", name: "name 7" },
    { id: "xxxxxxxxx", name: "name 8" },
  ];
});
