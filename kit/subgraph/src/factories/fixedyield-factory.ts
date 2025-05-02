import { FixedYieldCreated as FixedYieldCreatedEvent } from "../../generated/FixedYieldFactory/FixedYieldFactory";
import { Bond as BondEntity } from "../../generated/schema";
import { FixedYield } from "../../generated/templates";
import { FixedYield as FixedYieldContract } from "../../generated/templates/FixedYield/FixedYield";
import { fetchFixedYield } from "../assets/fetch/fixed-yield";
import { fetchAccount } from "../fetch/account";
import { createActivityLogEntry, EventType } from "../fetch/activity-log";
import { FactoryType } from "../utils/enums";
import { fetchFactory } from "./fetch/factory";

export function handleFixedYieldCreated(event: FixedYieldCreatedEvent): void {
  // Create/update factory
  const factory = fetchFactory(event.address, FactoryType.fixedyield);

  // Create template
  FixedYield.create(event.params.schedule);

  // Create entity
  const fixedYield = fetchFixedYield(event.params.schedule);

  // Record event
  const sender = fetchAccount(event.transaction.from);

  createActivityLogEntry(event, EventType.FixedYieldCreated, [
    event.params.schedule,
    event.params.creator,
  ]);

  // Check contract data
  const fixedYieldContract = FixedYieldContract.bind(event.params.schedule);
  const tokenResult = fixedYieldContract.try_token();

  if (!tokenResult.reverted) {
    // Check Bond relationship
    const bondEntity = BondEntity.load(tokenResult.value);
    if (bondEntity) {
      bondEntity.yieldSchedule = event.params.schedule;
      bondEntity.save();
    }
  }
}
