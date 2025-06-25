import { DEFAULT_PINCODE } from "test/utils/user";
import { OrpcClient } from "./orpc-client";

export async function bootstrapSystem(orpClient: OrpcClient) {
  const systems = await orpClient.system.list();
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
