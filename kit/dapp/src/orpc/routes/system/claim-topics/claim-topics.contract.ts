import { baseContract } from "@/orpc/procedures/base.contract";
import {
  TopicCreateInputSchema,
  TopicCreateOutputSchema,
} from "@/orpc/routes/system/claim-topics/routes/topic.create.schema";
import {
  TopicDeleteInputSchema,
  TopicDeleteOutputSchema,
} from "@/orpc/routes/system/claim-topics/routes/topic.delete.schema";
import { TopicListOutputSchema } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import {
  TopicUpdateInputSchema,
  TopicUpdateOutputSchema,
} from "@/orpc/routes/system/claim-topics/routes/topic.update.schema";

const TAGS = ["claim-topics"];

/**
 * Contract definition for listing topic schemes.
 *
 * Retrieves all registered topic schemes from the subgraph,
 * including both system-reserved and custom topics.
 */
const topicList = baseContract
  .route({
    method: "GET",
    path: "/system/claim-topics",
    description: "List all registered topic schemes in the system",
    successDescription: "Topic schemes retrieved successfully",
    tags: TAGS,
  })
  .output(TopicListOutputSchema);

/**
 * Contract definition for creating topic schemes.
 *
 * Registers a new topic scheme that can be used for identity claims.
 * Requires CLAIM_POLICY_MANAGER_ROLE or SYSTEM_MODULE_ROLE permissions.
 */
const topicCreate = baseContract
  .route({
    method: "POST",
    path: "/system/claim-topics",
    description: "Register a new topic scheme for identity claims",
    successDescription: "Topic scheme registered successfully",
    tags: TAGS,
  })
  .input(TopicCreateInputSchema)
  .output(TopicCreateOutputSchema);

/**
 * Contract definition for updating topic schemes.
 *
 * Updates the signature of an existing topic scheme.
 * Only the signature can be modified - name and ID remain immutable.
 */
const topicUpdate = baseContract
  .route({
    method: "PUT",
    path: "/system/claim-topics/:name",
    description: "Update the signature of an existing topic scheme",
    successDescription: "Topic scheme signature updated successfully",
    tags: TAGS,
  })
  .input(TopicUpdateInputSchema)
  .output(TopicUpdateOutputSchema);

/**
 * Contract definition for removing topic schemes.
 *
 * Permanently removes a topic scheme from the registry.
 * This prevents new claims from being issued for this topic.
 */
const topicDelete = baseContract
  .route({
    method: "DELETE",
    path: "/system/claim-topics/:name",
    description: "Remove a topic scheme from the registry",
    successDescription: "Topic scheme removed successfully",
    tags: TAGS,
  })
  .input(TopicDeleteInputSchema)
  .output(TopicDeleteOutputSchema);

export const claimTopicsContract = {
  topicList,
  topicCreate,
  topicUpdate,
  topicDelete,
};
