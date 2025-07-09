import { tokenRouter } from "@/orpc/procedures/token.router";

export const read = tokenRouter.token.read.handler(({ context: { token } }) => {
  return token;
});
