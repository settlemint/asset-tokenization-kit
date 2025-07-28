import { MutationOutput } from "@/orpc/routes/common/schemas/mutation.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

type Stream = Pick<MutationOutput, "status" | "message">;

export async function waitForStream(
  result: AsyncIteratorObject<Stream>,
  eventName: string
) {
  for await (const event of result) {
    logger.info(`${eventName} event`, event);
    if (event.status === "failed") {
      throw new Error(event.message);
    }
  }
}
