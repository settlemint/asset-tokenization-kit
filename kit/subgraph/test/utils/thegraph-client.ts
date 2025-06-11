import { createTheGraphClient } from "@settlemint/sdk-thegraph";
import { introspection } from "../../the-graph-env";

export const { client: theGraphClient, graphql: theGraphGraphql } =
  createTheGraphClient<{
    introspection: introspection;
    disableMasking: true;
    // https://thegraph.com/docs/en/subgraphs/developing/creating/ql-schema/#built-in-scalar-types
    scalars: {
      Bytes: string;
      Int8: string;
      BigInt: string;
      BigDecimal: string;
      Timestamp: string;
    };
  }>({
    instances: ["http://localhost:8100/subgraphs/name/smart-protocol"],
    subgraphName: "smart-protocol",
  });
