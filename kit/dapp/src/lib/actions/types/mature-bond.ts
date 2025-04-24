import { db } from "@/lib/db";
import { actions } from "@/lib/db/schema-assets";
import { DEFAULT_SETTINGS, SETTING_KEYS } from "@/lib/db/schema-settings";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import type { Event } from "@/lib/queries/transactions/transaction-fragment";
import { getAddress } from "viem";

export type BondCreatedEvent = Event & {
  eventName: "BondCreated";
  args: {
    token: string;
    creator: string;
  };
};

export async function addMatureBondAction(event: BondCreatedEvent) {
  const { token } = event.args;
  const bond = await getBondDetail({
    address: getAddress(token),
    userCurrency: DEFAULT_SETTINGS[SETTING_KEYS.BASE_CURRENCY],
  });
  const dueAt = new Date(Number(bond.maturityDate) * 1000);
  await db.insert(actions).values({
    assetId: token,
    actionType: "MATURE_BOND",
    dueAt,
  });
}
