import type { OnChainStableCoin } from "@/lib/queries/stablecoin/stablecoin-schema";
import { describe, expect, it, mock } from "bun:test";
import { addSeconds } from "date-fns";
import { stablecoinCalculateFields } from "./stablecoin-calculated";

describe("stablecoinCalculateFields", () => {
  mock.module("@/lib/queries/asset-price/asset-price", () => ({
    getAssetPriceInUserCurrency: mock(() => Promise.resolve(1)),
  }));

  it("should calculate concentration correctly when totalSupplyExact is non-zero", async () => {
    const onChainStableCoin: Partial<OnChainStableCoin> = {
      holders: [
        { valueExact: 500n },
        { valueExact: 300n },
        { valueExact: 200n },
      ],
      totalSupplyExact: 1000n,
      lastCollateralUpdate: new Date(0),
      liveness: 0n,
    };

    const result = await stablecoinCalculateFields(
      onChainStableCoin as OnChainStableCoin
    );
    expect(result.concentration).toBe(100); // (500 + 300 + 200) / 1000 * 100 = 100%
  });

  it("should calculate concentration as 0 when totalSupplyExact is zero", async () => {
    const onChainStableCoin: Partial<OnChainStableCoin> = {
      holders: [{ valueExact: 500n }, { valueExact: 300n }],
      totalSupplyExact: 0n,
      lastCollateralUpdate: new Date(0),
      liveness: 0n,
    };

    const result = await stablecoinCalculateFields(
      onChainStableCoin as OnChainStableCoin
    );
    expect(result.concentration).toBe(0);
  });

  it("should calculate collateralProofValidity correctly when lastCollateralUpdate is non-zero", async () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const liveness = "86400"; // 24 hours in seconds
    const onChainStableCoin: Partial<OnChainStableCoin> = {
      holders: [],
      totalSupplyExact: 1000n,
      lastCollateralUpdate: new Date(Number(timestamp) * 1000),
      liveness: BigInt(liveness),
    };

    const result = await stablecoinCalculateFields(
      onChainStableCoin as OnChainStableCoin
    );
    const expectedDate = addSeconds(
      new Date(Number(timestamp) * 1000),
      Number(liveness)
    );

    expect(result.collateralProofValidity).toEqual(expectedDate);
  });

  it("should set collateralProofValidity to undefined when lastCollateralUpdate is set to zero", async () => {
    const onChainStableCoin: Partial<OnChainStableCoin> = {
      holders: [],
      totalSupplyExact: 1000n,
      lastCollateralUpdate: new Date(0),
      liveness: 86400n,
    };

    const result = await stablecoinCalculateFields(
      onChainStableCoin as OnChainStableCoin
    );
    expect(result.collateralProofValidity).toBeUndefined();
  });

  it("should handle empty holders array", async () => {
    const onChainStableCoin: Partial<OnChainStableCoin> = {
      holders: [],
      totalSupplyExact: 1000n,
      lastCollateralUpdate: new Date(0),
      liveness: 0n,
    };

    const result = await stablecoinCalculateFields(
      onChainStableCoin as OnChainStableCoin
    );
    expect(result.concentration).toBe(0);
  });

  it("should include price in the result", async () => {
    const onChainStableCoin: Partial<OnChainStableCoin> = {
      id: "0x1234567890123456789012345678901234567890",
      holders: [],
      totalSupplyExact: 1000n,
      lastCollateralUpdate: new Date(0),
      liveness: 0n,
    };

    const result = await stablecoinCalculateFields(
      onChainStableCoin as OnChainStableCoin
    );
    expect(result.price).toBe(1);
  });
});
