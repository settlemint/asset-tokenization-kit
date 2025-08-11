import { Address, Bytes } from "@graphprotocol/graph-ts";
import { TopicSchemeRegistry } from "../../../generated/schema";
import { TopicSchemeRegistry as TopicSchemeRegistryTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchTopicSchemeRegistry(
  address: Address
): TopicSchemeRegistry {
  let topicSchemeRegistry = TopicSchemeRegistry.load(address);

  if (!topicSchemeRegistry) {
    topicSchemeRegistry = new TopicSchemeRegistry(address);
    topicSchemeRegistry.account = fetchAccount(address).id;
    topicSchemeRegistry.deployedInTransaction = Bytes.empty();
    topicSchemeRegistry.save();
    TopicSchemeRegistryTemplate.create(address);
    setAccountContractName(address, "Topic Scheme Registry");
  }

  return topicSchemeRegistry;
}
