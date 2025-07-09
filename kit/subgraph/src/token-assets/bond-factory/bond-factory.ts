import { Bytes } from "@graphprotocol/graph-ts";
import { BondCreated } from "../../../generated/templates/BondFactory/BondFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { fetchTopicScheme } from "../../topic-scheme-registry/fetch/topic-scheme";
import { setBigNumber } from "../../utils/bignumber";
import { fetchBond } from "../bond/fetch/bond";
import { createAction, getOrCreateActionExecutor } from "../../actions/action-utils";

export function handleBondCreated(event: BondCreated): void {
  fetchEvent(event, "BondCreated");

  const token = fetchToken(event.params.tokenAddress);
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  const requiredClaimTopics = new Array<Bytes>();
  for (let i = 0; i < event.params.requiredClaimTopics.length; i++) {
    const topicSchema = fetchTopicScheme(event.params.requiredClaimTopics[i]);
    requiredClaimTopics.push(topicSchema.id);
  }
  token.requiredClaimTopics = requiredClaimTopics;
  token.save();

  const bond = fetchBond(event.params.tokenAddress);
  setBigNumber(
    bond,
    "faceValue",
    event.params.faceValue,
    event.params.decimals
  );
  bond.maturityDate = event.params.maturityDate;
  bond.isMatured = false;
  bond.underlyingAsset = event.params.underlyingAsset;
  bond.save();
  
  // Create MatureBond action for admin, active at maturity date
  const actionExecutor = getOrCreateActionExecutor(
    event.params.tokenAddress,
    [event.transaction.from] // Admin who created the bond
  );
  
  const actionId = event.params.tokenAddress.concat(Bytes.fromUTF8("mature"));
  createAction(
    actionId,
    actionExecutor,
    "MatureBond",
    "Admin",
    event.block.timestamp,
    event.params.maturityDate, // Active at maturity date
    null, // No expiration
    event.params.tokenAddress
  );
}
