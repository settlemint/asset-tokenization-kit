import { CUSTOM_ERROR_CODES } from "@/orpc/procedures/base.contract";
import type { EntityListOutput } from "./entity.list.schema";
import { errorMessageForCode, getOrpcClient } from "@test/fixtures/orpc-client";
import {
  DEFAULT_ADMIN,
  DEFAULT_INVESTOR,
  signInWithUser,
} from "@test/fixtures/user";
import { waitUntil } from "@test/helpers/test-helpers";
import { beforeAll, describe, expect, it } from "vitest";

describe("Entity list (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;
  let investorClient: ReturnType<typeof getOrpcClient>;
  let seededSnapshot: EntityListOutput;
  let entityTypeFilter: NonNullable<
    EntityListOutput["items"][number]["entityType"]
  >;

  beforeAll(async () => {
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);

    const investorHeaders = await signInWithUser(DEFAULT_INVESTOR);
    investorClient = getOrpcClient(investorHeaders);

    // Ensure The Graph has indexed at least one typed entity before running assertions.
    seededSnapshot = await waitUntil({
      get: () =>
        adminClient.system.entity.list({
          limit: 100,
          offset: 0,
          orderDirection: "desc",
          orderBy: "lastActivity",
        }),
      until: (result) => result.items.some((item) => item.entityType),
      timeoutMs: 120_000,
      intervalMs: 2000,
    });

    entityTypeFilter = seededSnapshot.items.find(
      (item) => item.entityType
    )!.entityType!;
  });

  it("returns paginated entities for authorized users", async () => {
    const page = await adminClient.system.entity.list({
      limit: 25,
      offset: 0,
      orderDirection: "desc",
      orderBy: "lastActivity",
    });

    expect(page.items.length).toBeGreaterThan(0);
    expect(page.total).toBeGreaterThan(0);
    expect(page.limit).toBe(25);
    expect(page.offset).toBe(0);

    for (const entity of page.items) {
      expect(entity.id).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(entity.activeClaimsCount).toBeGreaterThanOrEqual(0);
      expect(entity.revokedClaimsCount).toBeGreaterThanOrEqual(0);
      expect(["pending", "registered"]).toContain(entity.status);
      expect(entity.deployedInTransaction.length).toBeGreaterThan(0);
    }
  });

  it("filters entities by entity type", async () => {
    const filtered = await adminClient.system.entity.list({
      limit: 100,
      offset: 0,
      filters: {
        entityType: entityTypeFilter,
      },
    });

    expect(filtered.items.length).toBeGreaterThan(0);
    expect(filtered.total).toBe(filtered.items.length);

    for (const entity of filtered.items) {
      expect(entity.entityType).toBe(entityTypeFilter);
    }
  });

  it("rejects users without entity permissions", async () => {
    await expect(
      investorClient.system.entity.list(
        {
          limit: 10,
        },
        {
          context: {
            skipLoggingFor: [CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED],
          },
        }
      )
    ).rejects.toThrow(
      errorMessageForCode(CUSTOM_ERROR_CODES.USER_NOT_AUTHORIZED)
    );
  });
});
