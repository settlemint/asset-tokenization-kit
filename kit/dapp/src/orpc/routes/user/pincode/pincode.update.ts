import { authRouter } from "@/orpc/procedures/auth.router";
import { set } from "@/orpc/routes/user/pincode/pincode.set";
import { call } from "@orpc/server";

export const update = authRouter.user.pincode.update.handler(async function ({
  context,
  input,
}) {
  return await call(set, input, {
    context,
  });
});
