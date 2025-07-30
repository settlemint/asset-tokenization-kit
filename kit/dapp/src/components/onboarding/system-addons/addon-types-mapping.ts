import type { SystemAddonType } from "@/orpc/routes/system/addon/routes/addon.create.schema";

export function getAddonTypeFromTypeId(typeId: string): SystemAddonType {
  const mapping: Record<string, SystemAddonType> = {
    ATKFixedYieldScheduleFactory: "yield",
    ATKPushAirdropFactory: "airdrops",
    // ATKTimeBoundAirdropFactory: "todo",
    // ATKVestingAirdropFactory: "todo",
    ATKXvPSettlementFactory: "xvp",
  };

  const type = mapping[typeId];
  if (!type) {
    throw new Error(`Invalid system addon typeId: ${typeId}`);
  }
  return type;
}
