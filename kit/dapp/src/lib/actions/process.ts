import type {
  Event,
  Receipt,
} from "@/lib/queries/transactions/transaction-fragment";
import type { WaitForTransactionsResponse } from "@/lib/queries/transactions/wait-for-transaction";
import {
  addMatureBondAction,
  type BondCreatedEvent,
} from "./types/mature-bond";

export async function updateActions({ receipts }: WaitForTransactionsResponse) {
  const promises = [];
  for (const receipt of receipts) {
    promises.push(processReceipt(receipt));
  }
  try {
    return handleSettled(await Promise.allSettled(promises));
  } catch (error) {
    console.error("Could not process actions", error);
  }
}

async function processReceipt(receipt: Receipt) {
  const events = receipt.events;
  if (!events || events.length === 0) {
    return;
  }
  const promises = [];
  for (const event of events) {
    promises.push(processEvent(event));
  }
  return handleSettled(await Promise.allSettled(promises));
}

async function processEvent(event: Event) {
  const eventName = event.eventName;
  switch (eventName) {
    case "BondCreated": {
      await addMatureBondAction(event as BondCreatedEvent);
      break;
    }
  }
}

function handleSettled(results: PromiseSettledResult<unknown>[]) {
  const errors = results.filter((result) => result.status !== "fulfilled");
  if (errors.length > 0) {
    console.error(
      `Failed to process ${errors.length} events: ${errors
        .map((error) => error.reason)
        .join(", ")}`
    );
  }
}
