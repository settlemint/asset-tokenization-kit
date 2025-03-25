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

mock.module("@/lib/settlemint/hasura", () => {
  return {
    hasuraClient: mock(() => ({})),
    hasuraGraphql: mock(() => ({})),
  };
});

mock.module("@/lib/db", () => {
  return {
    db: mock(() => ({})),
  };
});

mock.module("@/lib/auth/auth", () => {
  return {
    auth: mock(() => ({})),
  };
});
