import { BigNumber } from "bignumber.js";
import { Elysia } from "elysia";
import SuperJSON from "superjson";
import { auth } from "../auth/auth";

SuperJSON.registerCustom<BigNumber, string>(
  {
    isApplicable: (v): v is BigNumber => BigNumber.isBigNumber(v),
    serialize: (v) => v.toJSON(),
    deserialize: (v) => new BigNumber(v),
  },
  "bignumber.js"
);

export const superJson = new Elysia({ name: "superjson" })
  .mapResponse(({ response }) => {
    if (response instanceof Object) {
      const { json } = SuperJSON.serialize(response);
      return new Response(JSON.stringify(json));
    }
  })
  .as("plugin");

export const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ error, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return error(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  })
  .as("plugin");
