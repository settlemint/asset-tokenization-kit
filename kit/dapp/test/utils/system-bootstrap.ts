import { expect } from "vitest";
import { OrpcClient } from "./orpc-client";
import { DEFAULT_PINCODE } from "./user";

export async function bootstrapSystem(orpClient: OrpcClient) {
  const systems = await orpClient.system.list({});
  if (systems.length > 0) {
    console.log("System already created");
    return systems[0]?.id;
  }
  const response = await orpClient.system.create({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: "pincode",
    },
  });
  let finalResult: `0x${string}` | undefined = undefined;
  for await (const event of response) {
    console.log(
      `System bootstrap event received: ${JSON.stringify(event, null, 2)}`
    );
    finalResult = event.result;
  }
  if (!finalResult) {
    throw new Error("Failed to bootstrap system");
  }
  return finalResult;
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
    console.log("All token factories already exist");
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
  for await (const event of result) {
    console.log(
      `Token factory create event received: ${JSON.stringify(event, null, 2)}`
    );
    if (event.result) {
      event.result.forEach((result) => {
        if (result.transactionHash) {
          transactionHashes.push(result.transactionHash);
        }
      });
    }
  }

  expect(transactionHashes).toBeArrayOfSize(nonExistingFactories.length);
  console.log("Token factories created");
}
