import { waitForTransactionReceipt } from "@settlemint/sdk-portal";
import { describe, expect, it } from "bun:test";
import { getOrpcClient } from "../utils/orpc-client";
import { DEFAULT_ADMIN, DEFAULT_PINCODE, signInWithUser } from "../utils/user";

describe("Token factory create", () => {
  it("can create a token factory", async () => {
    const headers = await signInWithUser(DEFAULT_ADMIN);
    const client = getOrpcClient(headers);
    const system = await client.system.read({ id: "default" });
    expect(system?.tokenFactoryRegistry).toBeDefined();

    if (system?.tokenFactoryRegistry) {
      const result = await client.token.factoryCreate({
        verification: {
          verificationCode: DEFAULT_PINCODE,
          verificationType: "pincode",
        },
        contract: system?.tokenFactoryRegistry,
        factories: [{ type: "equity", name: "Test Token" }],
      });

      let transactionHash: string | undefined;
      for await (const event of result) {
        if (event.result?.["0"]?.transactionHash) {
          transactionHash = event.result["0"].transactionHash;
        }
      }

      expect(transactionHash).toBeDefined();
      if (transactionHash) {
        await waitForTransactionReceipt(transactionHash, {
          portalGraphqlEndpoint:
            process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT!,
        });
      }

      const factories = await client.token.factoryList({});
      expect(factories.length).toBeGreaterThan(0);
    }
  });
});
