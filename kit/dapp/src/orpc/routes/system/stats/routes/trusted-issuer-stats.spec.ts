import { getOrpcClient } from "@test/fixtures/orpc-client";
import { DEFAULT_ADMIN, signInWithUser } from "@test/fixtures/user";
import { beforeAll, describe, expect, it } from "vitest";

describe("Trusted issuer stats (integration)", () => {
  let adminClient: ReturnType<typeof getOrpcClient>;

  beforeAll(async () => {
    // Admin user has all permissions
    const adminHeaders = await signInWithUser(DEFAULT_ADMIN);
    adminClient = getOrpcClient(adminHeaders);
  });

  it("should successfully retrieve trusted issuer statistics with trailing24Hours preset", async () => {
    const result =
      await adminClient.system.stats.trustedIssuerStats("trailing24Hours");

    // Assert response structure
    expect(result).toBeDefined();
    expect(result.range).toBeDefined();
    expect(result.range.from).toBeInstanceOf(Date);
    expect(result.range.to).toBeInstanceOf(Date);
    expect(result.range.interval).toBe("hour");
    expect(result.range.isPreset).toBe(true);

    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);

    // Assert last data point values (end of timeseries)
    const lastDataPoint = result.data.at(-1);
    expect(lastDataPoint).toBeDefined();
    expect(lastDataPoint?.timestamp).toBeInstanceOf(Date);

    // Admin is already a trusted issuer, so these should be >= 1
    expect(lastDataPoint?.totalAddedTrustedIssuers).toBeGreaterThanOrEqual(1);
    expect(lastDataPoint?.totalActiveTrustedIssuers).toBeGreaterThanOrEqual(1);

    // Removed count should be defined
    expect(lastDataPoint?.totalRemovedTrustedIssuers).toBeGreaterThanOrEqual(0);
  });
});
