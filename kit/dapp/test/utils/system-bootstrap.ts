import { expect } from "vitest";
import { OrpcClient } from "./orpc-client";
import { DEFAULT_PINCODE } from "./user";

export async function bootstrapSystem(orpClient: OrpcClient) {
  const systems = await orpClient.system.list({});
  if (systems.length > 0) {
    return systems[0]?.id;
  }
  const response = await orpClient.system.create({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
  });

  if (!response?.id) {
    throw new Error("Failed to bootstrap system");
  }

  return response.id;
}

export async function bootstrapTokenFactories(orpClient: OrpcClient) {
  const system = await orpClient.system.read({ id: "default" });
  if (!system) {
    throw new Error("System not found");
  }
  if (!system.tokenFactoryRegistry) {
    throw new Error("Token factory registry not found");
  }
  const tokenFactories = await orpClient.token.factoryList({});

  const factories: Parameters<
    typeof orpClient.token.factoryCreate
  >[0]["factories"] = [
    { type: "bond", name: "Bond Factory" },
    { type: "deposit", name: "Deposit Factory" },
    { type: "equity", name: "Equrity Factory" },
    { type: "fund", name: "Fund Factory" },
    { type: "stablecoin", name: "Stablecoin Factory" },
  ];

  const nonExistingFactories = factories.filter(
    (factory) => !tokenFactories.some((t) => t.name === factory.name)
  );

  if (nonExistingFactories.length === 0) {
    return;
  }

  const result = await orpClient.token.factoryCreate({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
    contract: system?.tokenFactoryRegistry,
    factories: nonExistingFactories,
  });

  const transactionHashes: string[] = [];

  if (result.results) {
    result.results.forEach((r) => {
      if (r.transactionHash) {
        transactionHashes.push(r.transactionHash);
      }
    });
  }

  const successfulCreations =
    result.results?.filter((r) => !r.error).length || 0;
  expect(successfulCreations).toBe(nonExistingFactories.length);
}
