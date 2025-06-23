import { Bytes } from "@graphprotocol/graph-ts";
import { FundCreated } from "../../../generated/templates/FundFactory/FundFactory";
import { fetchEvent } from "../../event/fetch/event";
import { fetchToken } from "../../token/fetch/token";
import { fetchTopicScheme } from "../../topic-scheme-registry/fetch/topic-scheme";
import { fetchFund } from "../fund/fetch/fund";

export function handleFundCreated(event: FundCreated): void {
  fetchEvent(event, "FundCreated");

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

  const fund = fetchFund(event.params.tokenAddress);
  fund.managementFeeBps = event.params.managementFeeBps;
  fund.save();
}
