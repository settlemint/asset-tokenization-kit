import { baseContract } from "@/orpc/procedures/base.contract";
import {
  EntityListInputSchema,
  EntityListOutputSchema,
} from "@/orpc/routes/system/entity/routes/entity.list.schema";

const TAGS = ["system", "entity"] as const;

const entityList = baseContract
  .route({
    method: "GET",
    path: "/system/entity/list",
    description:
      "Retrieve business entities created within the current system including contract metadata and verification status.",
    successDescription:
      "Entities fetched successfully with pagination metadata and classification details.",
    tags: TAGS,
  })
  .input(EntityListInputSchema)
  .output(EntityListOutputSchema);

export const entityContract = {
  list: entityList,
};
