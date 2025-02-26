import { FixedYieldCreated as FixedYieldCreatedEvent } from "../../generated/FixedYieldFactory/FixedYieldFactory";
import { FixedYield } from "../../generated/templates";
import { FactoryType } from "../utils/enums";
import { fetchFactory } from "./fetch/factory";

export function handleFixedYieldCreated(event: FixedYieldCreatedEvent): void {
  fetchFactory(event.address, FactoryType.fixedyield);
  FixedYield.create(event.params.schedule);
}
