import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  XvPSettlement,
  XvPSettlementApproval,
  XvPSettlementFlow,
} from "../../../generated/schema";
import { XvPSettlement as XvPSettlementContract } from "../../../generated/templates/XvPSettlement/XvPSettlement";
import { fetchAssetDecimals } from "../../assets/fetch/asset";
import { fetchAccount } from "../../utils/account";
import { toDecimals } from "../../utils/decimals";

/**
 * Fetches or creates a Flow entity
 * @param settlementId The address of the XvPSettlement contract
 * @param flowData The flow data from the contract
 * @param index The index of the flow in the flows array
 * @returns The Flow entity
 */
export function fetchFlow(
  settlementId: Address,
  asset: Address,
  from: Address,
  to: Address,
  amount: BigInt,
  index: i32
): XvPSettlementFlow {
  let flowId = settlementId.concat(Bytes.fromI32(index));
  let flow = XvPSettlementFlow.load(flowId);
  if (flow) {
    return flow;
  }

  flow = new XvPSettlementFlow(flowId);
  flow.xvpSettlement = settlementId;
  flow.asset = asset;
  flow.from = fetchAccount(from).id;
  flow.to = fetchAccount(to).id;
  flow.amount = toDecimals(amount, fetchAssetDecimals(asset));
  flow.amountExact = amount;
  flow.save();
  return flow;
}

export function fetchApproval(
  contract: Address,
  sender: Address
): XvPSettlementApproval {
  const id = contract.concat(sender);
  let approval = XvPSettlementApproval.load(id);
  if (approval) {
    return approval;
  }
  approval = new XvPSettlementApproval(id);
  approval.xvpSettlement = contract;
  approval.account = fetchAccount(sender).id;

  approval.save();
  return approval;
}

/**
 * Fetches or creates a XvPSettlement entity
 * @param id The id of the XvPSettlement
 * @returns The XvPSettlement entity
 */
export function fetchXvPSettlement(id: Address): XvPSettlement {
  let xvpSettlement = XvPSettlement.load(id);

  if (xvpSettlement == null) {
    let endpoint = XvPSettlementContract.bind(id);
    let cutoffDate = endpoint.try_cutoffDate();
    let autoExecute = endpoint.try_autoExecute();
    let claimed = endpoint.try_claimed();
    let cancelled = endpoint.try_cancelled();
    let flows = endpoint.try_flows();
    let createdAt = endpoint.try_createdAt();
    xvpSettlement = new XvPSettlement(id);
    xvpSettlement.cutoffDate = cutoffDate.reverted
      ? BigInt.zero()
      : cutoffDate.value;
    xvpSettlement.autoExecute = autoExecute.reverted
      ? false
      : autoExecute.value;
    xvpSettlement.claimed = claimed.reverted ? false : claimed.value;
    xvpSettlement.cancelled = cancelled.reverted ? false : cancelled.value;
    xvpSettlement.createdAt = createdAt.reverted
      ? BigInt.zero()
      : createdAt.value;
    xvpSettlement.save();

    if (!flows.reverted) {
      for (let i = 0; i < flows.value.length; i++) {
        fetchFlow(
          id,
          flows.value[i].asset,
          flows.value[i].from,
          flows.value[i].to,
          flows.value[i].amount,
          i
        );
      }
    }
  }

  return xvpSettlement;
}
