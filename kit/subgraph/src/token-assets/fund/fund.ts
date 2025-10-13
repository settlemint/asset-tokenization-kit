import { ManagementFeeCollected } from "../../../generated/templates/Fund/Fund";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { handleMint } from "../../token/utils/token-mint-utils";

export function handleManagementFeeCollected(
  event: ManagementFeeCollected
): void {
  const eventEntry = fetchEvent(event, "ManagementFeeCollected");
  const token = fetchToken(event.address);

  handleMint(
    eventEntry,
    token,
    event.params.sender,
    event.params.amount,
    event.block.timestamp
  );
}
