import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TopicScheme } from "../../../generated/schema";
import { fetchTopicSchemeRegistry } from "./topic-scheme-registry";

export function fetchTopicScheme(
  topicId: BigInt,
  registryAddress: Address | null = null
): TopicScheme {
  const id = Bytes.fromUTF8(topicId.toHexString());
  let topicScheme = TopicScheme.load(id);

  if (!topicScheme) {
    topicScheme = new TopicScheme(id);
    if (registryAddress) {
      const registry = fetchTopicSchemeRegistry(registryAddress);
      topicScheme.registry = registry.id;
    } else {
      topicScheme.registry = Address.zero();
    }
    topicScheme.name = "";
    topicScheme.topicId = BigInt.zero();
    topicScheme.signature = "";
    topicScheme.enabled = true;
    topicScheme.deployedInTransaction = Bytes.empty();
    topicScheme.save();
  }

  return topicScheme;
}
