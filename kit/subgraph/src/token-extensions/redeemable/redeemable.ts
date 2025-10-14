import { Redeemed } from "../../../generated/templates/Redeemable/Redeemable";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { setBigNumber } from "../../utils/bignumber";
import { handleBurn } from "../burnable/utils/burnable-utils";
import { fetchRedeemable } from "./fetch/redeemable";

export function handleRedeemed(event: Redeemed): void {
  const eventEntry = fetchEvent(event, "Redeemed");
  const redeemable = fetchRedeemable(event.address);
  const token = fetchToken(event.address);
  setBigNumber(
    redeemable,
    "redeemedAmount",
    redeemable.redeemedAmountExact.plus(event.params.amount),
    token.decimals
  );
  redeemable.save();
  handleBurn(
    eventEntry,
    token,
    event.params.sender,
    event.params.amount,
    event.block.timestamp
  );
}
