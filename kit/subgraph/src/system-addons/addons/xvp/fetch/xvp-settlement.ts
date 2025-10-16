import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  XvPSettlement,
  XvPSettlementApproval,
  XvPSettlementCancelVote,
  XvPSettlementFlow,
} from "../../../../../generated/schema";
import { XvPSettlement as XvPSettlementTemplate } from "../../../../../generated/templates";
import { XvPSettlement as XvPSettlementContract } from "../../../../../generated/templates/XvPSettlement/XvPSettlement";
import { fetchAccount } from "../../../../account/fetch/account";
import { fetchAssetReference } from "../../../../asset-reference/fetch/asset-reference";
import { fetchToken } from "../../../../token/fetch/token";
import { setBigNumber } from "../../../../utils/bignumber";

/**
 * Fetches or creates a Flow entity
 * @param settlementId The address of the XvPSettlement contract
 * @param asset The asset address
 * @param from The from address
 * @param to The to address
 * @param amountExact The exact amount
 * @param index The index of the flow in the flows array
 * @returns The Flow entity
 */
export function fetchXvPSettlementFlow(
  settlementId: Address,
  asset: Address,
  from: Address,
  to: Address,
  amountExact: BigInt,
  externalChainId: BigInt,
  index: i32
): XvPSettlementFlow {
  const flowId = settlementId.concat(Bytes.fromI32(index));
  let flow = XvPSettlementFlow.load(flowId);
  if (!flow) {
    flow = new XvPSettlementFlow(flowId);
    flow.xvpSettlement = settlementId;
  }
  const assetReference = fetchAssetReference(asset, externalChainId);
  flow.assetReference = assetReference.id;
  if (externalChainId.equals(BigInt.zero())) {
    const token = fetchToken(asset);
    flow.asset = token.id;
    setBigNumber(flow, "amount", amountExact, token.decimals);
  } else {
    flow.asset = null;
    setBigNumber(flow, "amount", amountExact, 0);
  }
  flow.from = fetchAccount(from).id;
  flow.to = fetchAccount(to).id;
  flow.externalChainId = externalChainId;
  flow.isExternal = !externalChainId.equals(BigInt.zero());
  flow.save();
  return flow;
}

export function fetchXvPSettlementCancelVote(
  contractAddress: Address,
  voterAddress: Address
): XvPSettlementCancelVote {
  const id = contractAddress.concat(voterAddress);
  let vote = XvPSettlementCancelVote.load(id);
  if (vote == null) {
    vote = new XvPSettlementCancelVote(id);
    vote.xvpSettlement = contractAddress;
    vote.account = fetchAccount(voterAddress).id;
    vote.active = false;
    vote.votedAt = null;
    vote.save();
  }
  return vote;
}

export function fetchXvPSettlementApproval(
  contractAddress: Address,
  senderAddress: Address
): XvPSettlementApproval {
  const id = contractAddress.concat(senderAddress);
  let approval = XvPSettlementApproval.load(id);
  if (approval) {
    return approval;
  }

  approval = new XvPSettlementApproval(id);
  approval.xvpSettlement = contractAddress;
  approval.account = fetchAccount(senderAddress).id;
  approval.approved = false;
  approval.timestamp = null;
  approval.save();
  return approval;
}

/**
 * Fetches or creates a XvPSettlement entity
 * @param id The address of the XvPSettlement
 * @returns The XvPSettlement entity
 */
export function fetchXvPSettlement(id: Address): XvPSettlement {
  let xvpSettlement = XvPSettlement.load(id);

  if (xvpSettlement == null) {
    const endpoint = XvPSettlementContract.bind(id);
    const cutoffDate = endpoint.try_cutoffDate();
    const autoExecute = endpoint.try_autoExecute();
    const executed = endpoint.try_executed();
    const cancelled = endpoint.try_cancelled();
    const flows = endpoint.try_flows();
    const createdAt = endpoint.try_createdAt();
    const name = endpoint.try_name();
    const hashlock = endpoint.try_hashlock();
    const hasExternalFlowsResult = endpoint.try_hasExternalFlows();
    const secretRevealedResult = endpoint.try_secretRevealed();

    xvpSettlement = new XvPSettlement(id);
    xvpSettlement.cutoffDate = cutoffDate.reverted
      ? BigInt.zero()
      : cutoffDate.value;
    xvpSettlement.autoExecute = autoExecute.reverted
      ? false
      : autoExecute.value;
    xvpSettlement.executed = executed.reverted ? false : executed.value;
    xvpSettlement.cancelled = cancelled.reverted ? false : cancelled.value;
    xvpSettlement.createdAt = createdAt.reverted
      ? BigInt.zero()
      : createdAt.value;
    xvpSettlement.name = name.reverted ? "" : name.value;
    xvpSettlement.deployedInTransaction = Bytes.empty();
    xvpSettlement.hashlock = hashlock.reverted ? Bytes.empty() : hashlock.value;

    const secretRevealedValue = secretRevealedResult.reverted
      ? false
      : secretRevealedResult.value;
    xvpSettlement.secretRevealed = secretRevealedValue;
    if (!secretRevealedValue) {
      xvpSettlement.secret = null;
      xvpSettlement.secretRevealedAt = null;
      xvpSettlement.secretRevealedBy = null;
      xvpSettlement.secretRevealTx = null;
    }

    let hasExternal = hasExternalFlowsResult.reverted
      ? false
      : hasExternalFlowsResult.value;

    const approvers: Address[] = [];

    if (!flows.reverted) {
      for (let i = 0; i < flows.value.length; i++) {
        const flow = flows.value[i];

        // Create flow entity with index-based ID
        fetchXvPSettlementFlow(
          id,
          flow.asset,
          flow.from,
          flow.to,
          flow.amount,
          flow.externalChainId,
          i
        );

        if (!flow.externalChainId.equals(BigInt.zero())) {
          hasExternal = true;
        }

        if (flow.externalChainId.equals(BigInt.zero())) {
          fetchXvPSettlementCancelVote(id, flow.from);
          fetchXvPSettlementCancelVote(id, flow.to);
        }

        if (flow.externalChainId.equals(BigInt.zero())) {
          // Collect unique approvers (from addresses)
          let fromExists = false;
          for (let j = 0; j < approvers.length; j++) {
            if (approvers[j].equals(flow.from)) {
              fromExists = true;
              break;
            }
          }
          if (!fromExists) {
            approvers.push(flow.from);
          }
        }
      }
    }

    xvpSettlement.hasExternalFlows = hasExternal;

    xvpSettlement.save();

    // Create template for dynamic tracking
    XvPSettlementTemplate.create(id);

    // Create approval entities for all approvers
    for (let i = 0; i < approvers.length; i++) {
      fetchXvPSettlementApproval(id, approvers[i]);
    }
  }

  return xvpSettlement;
}
