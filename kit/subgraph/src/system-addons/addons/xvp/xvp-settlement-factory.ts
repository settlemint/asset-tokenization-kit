import { Address, Bytes } from "@graphprotocol/graph-ts";
import { ATKXvPSettlementCreated } from "../../../../generated/templates/XvPSettlementFactory/XvPSettlementFactory";
import { ActionName, ActionType, createAction } from "../../../actions/action";
import { fetchEvent } from "../../../event/fetch/event";
import { fetchXvPSettlement } from "./fetch/xvp-settlement";

export function handleATKXvPSettlementCreated(
  event: ATKXvPSettlementCreated
): void {
  fetchEvent(event, "XvPSettlementCreated");
  const xvpSettlement = fetchXvPSettlement(event.params.settlement);
  xvpSettlement.deployedInTransaction = event.transaction.hash;
  xvpSettlement.save();

  const approvals = xvpSettlement.approvals.load();
  for (let i = 0; i < approvals.length; i++) {
    const approval = approvals[i];
    // Extract the original address from the approval ID: contractAddress.concat(senderAddress)
    // The approval ID contains: [contractAddress (20 bytes)][senderAddress (20 bytes)]
    const originalAddressBytes = Bytes.fromUint8Array(approval.id.subarray(20)); // Skip first 20 bytes (contract address)
    const originalAddress = Address.fromBytes(originalAddressBytes);
    createAction(
      event,
      ActionName.ApproveXvPSettlement,
      event.params.settlement,
      ActionType.User,
      event.block.timestamp,
      xvpSettlement.cutoffDate,
      [originalAddress],
      null,
      originalAddressBytes.toHexString()
    );
  }
}
