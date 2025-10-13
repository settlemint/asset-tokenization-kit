import { BurnCompleted } from "../../../generated/templates/Burnable/Burnable";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { handleBurn } from "./utils/burnable-utils";

export function handleBurnCompleted(event: BurnCompleted): void {
  const eventEntry = fetchEvent(event, "BurnCompleted");
  const token = fetchToken(event.address);

  handleBurn(
    eventEntry,
    token,
    event.params.from,
    event.params.amount,
    event.block.timestamp
  );
}
