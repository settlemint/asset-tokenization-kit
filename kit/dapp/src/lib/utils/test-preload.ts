import { mock } from "bun:test";

mock.module("@/lib/settlemint/the-graph", () => {
  return {
    theGraphClientKit: mock(() => ({})),
    theGraphGraphqlKit: mock(() => ({})),
  };
});

mock.module("@/lib/settlemint/portal", () => {
  return {
    portalClient: mock(() => ({})),
    portalGraphql: mock(() => ({})),
  };
});
