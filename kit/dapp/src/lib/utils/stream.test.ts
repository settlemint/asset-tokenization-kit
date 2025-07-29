import type { MutationOutput } from "@/orpc/routes/common/schemas/mutation.schema";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { waitForStream } from "./stream";

type Stream = Pick<MutationOutput, "status" | "message">;

// Helper function to create async iterator from array
function createAsyncIterator<T>(items: T[]): AsyncIterable<T> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const item of items) {
        await Promise.resolve(); // Satisfy eslint require-await rule
        yield item;
      }
    },
  };
}

describe("waitForStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("processes empty stream without errors", async () => {
    const emptyStream = createAsyncIterator<Stream>([]);
    const eventName = "test-event";

    await expect(
      waitForStream(emptyStream as AsyncIteratorObject<Stream>, eventName)
    ).resolves.toBeUndefined();
  });

  test("processes single successful event", async () => {
    const stream = createAsyncIterator<Stream>([
      { status: "completed", message: "Success" },
    ]);
    const eventName = "deployment";

    await expect(
      waitForStream(stream as AsyncIteratorObject<Stream>, eventName)
    ).resolves.toBeUndefined();
  });

  test("processes multiple successful events in sequence", async () => {
    const events: Stream[] = [
      { status: "pending", message: "Starting transaction" },
      { status: "confirmed", message: "Transaction confirmed" },
      { status: "completed", message: "Process completed" },
    ];
    const stream = createAsyncIterator(events);
    const eventName = "multi-step";

    await expect(
      waitForStream(stream as AsyncIteratorObject<Stream>, eventName)
    ).resolves.toBeUndefined();
  });

  test("throws error when event status is 'failed'", async () => {
    const stream = createAsyncIterator<Stream>([
      { status: "pending", message: "Starting" },
      {
        status: "failed",
        message: "Transaction failed due to insufficient gas",
      },
    ]);
    const eventName = "failed-transaction";

    await expect(
      waitForStream(stream as AsyncIteratorObject<Stream>, eventName)
    ).rejects.toThrow("Transaction failed due to insufficient gas");
  });

  test("maintains correct async behavior", async () => {
    const events: Stream[] = [
      { status: "pending", message: "First" },
      { status: "completed", message: "Second" },
    ];

    // Create an iterator that adds delay to simulate real async behavior
    const delayedStream: AsyncIterable<Stream> = {
      async *[Symbol.asyncIterator]() {
        for (const event of events) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          yield event;
        }
      },
    };

    const startTime = Date.now();
    await waitForStream(
      delayedStream as AsyncIteratorObject<Stream>,
      "delayed-events"
    );
    const endTime = Date.now();

    // Should take at least 20ms due to delays
    expect(endTime - startTime).toBeGreaterThanOrEqual(15);
  });
});
