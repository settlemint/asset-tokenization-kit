import { Address, Bytes } from "@graphprotocol/graph-ts";
import { TopicSchemeRegistry } from "../../../generated/schema";
import { TopicSchemeRegistry as TopicSchemeRegistryTemplate } from "../../../generated/templates";
import { fetchAccessControl } from "../../access-control/fetch/accesscontrol";
import { fetchAccount } from "../../account/fetch/account";

export function fetchTopicSchemeRegistry(
  address: Address
): TopicSchemeRegistry {
  let topicSchemeRegistry = TopicSchemeRegistry.load(address);

  if (!topicSchemeRegistry) {
    topicSchemeRegistry = new TopicSchemeRegistry(address);
    topicSchemeRegistry.accessControl = fetchAccessControl(address).id;
    topicSchemeRegistry.account = fetchAccount(address).id;
    topicSchemeRegistry.deployedInTransaction = Bytes.empty();
    topicSchemeRegistry.save();
    TopicSchemeRegistryTemplate.create(address);
  }

  return topicSchemeRegistry;
}
