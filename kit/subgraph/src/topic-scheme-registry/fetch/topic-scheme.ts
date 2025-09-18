import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TopicScheme } from "../../../generated/schema";
import { fetchTopicSchemeRegistry } from "./topic-scheme-registry";

export function fetchTopicScheme(
  topicId: BigInt,
  topicSchemeRegistryAddress: Address
): TopicScheme {
  const id = topicSchemeRegistryAddress.concat(
    Bytes.fromUTF8(topicId.toHexString())
  );
  let topicScheme = TopicScheme.load(id);

  if (!topicScheme) {
    topicScheme = new TopicScheme(id);
    const registry = fetchTopicSchemeRegistry(topicSchemeRegistryAddress);
    topicScheme.registry = registry.id;
    topicScheme.name = "";
    topicScheme.topicId = BigInt.zero();
    topicScheme.signature = "";
    topicScheme.enabled = true;
    topicScheme.deployedInTransaction = Bytes.empty();
    topicScheme.save();
  }

  return topicScheme;
}
