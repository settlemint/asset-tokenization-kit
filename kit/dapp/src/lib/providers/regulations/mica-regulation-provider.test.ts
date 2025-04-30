/**
 * Tests for MICA regulation provider implementation
 */
import {
  RegulationStatus,
  RegulationType,
} from "@/lib/db/regulations/schema-base-regulation-configs";
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { MicaRegulationProvider } from "./mica-regulation-provider";

// Mock the db module
mock.module("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          execute: () => [],
        }),
      }),
    }),
  },
}));

// Import after mocking

describe("MICA Regulation Provider", () => {
  let provider: MicaRegulationProvider;

  beforeEach(() => {
    provider = new MicaRegulationProvider();
    // Clear any mock records
    mock.restore();
  });

  test("getTypeSpecificConfig returns undefined for non-MICA regulations", async () => {
    // Arrange
    const regulationConfigId = "test-regulation-id";
    const baseConfig = {
      id: regulationConfigId,
      assetId: "test-asset-id",
      regulationType: "not-mica" as RegulationType,
      status: RegulationStatus.COMPLIANT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Act
    const result = await provider["getTypeSpecificConfig"](
      regulationConfigId,
      baseConfig
    );

    // Assert
    expect(result).toBeUndefined();
  });
});
