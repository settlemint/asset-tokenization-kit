/**
 * Tests for regulation provider index exports
 */
import {
  RegulationStatus,
  RegulationType,
} from "@/lib/db/regulations/schema-base-regulation-configs";
import { beforeEach, describe, expect, mock, test } from "bun:test";
import {
  createRegulation,
  getRegulationById,
  getRegulationsByAssetId,
  updateRegulation,
} from "./regulation-provider";

// Create a base mock provider with all methods
const mockProvider = {
  create: mock(() => Promise.resolve("mock-id")),
  update: mock(() => Promise.resolve()),
  getById: mock(() =>
    Promise.resolve({
      baseConfig: {
        id: "mock-id",
        assetId: "asset-123",
        regulationType: RegulationType.MICA,
        status: RegulationStatus.COMPLIANT,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      specificConfig: { documents: [] },
    })
  ),
  getByAssetId: mock(() =>
    Promise.resolve([
      {
        baseConfig: {
          id: "mock-id",
          assetId: "asset-123",
          regulationType: RegulationType.MICA,
          status: RegulationStatus.COMPLIANT,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        specificConfig: { documents: [] },
      },
    ])
  ),
};

// Mock the factory to return our mock provider
mock.module("./regulation-factory", () => ({
  createRegulationProvider: () => mockProvider,
}));

describe("Regulation Provider API", () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockProvider.create.mockClear();
    mockProvider.update.mockClear();
    mockProvider.getById.mockClear();
    mockProvider.getByAssetId.mockClear();
  });

  test("createRegulation calls the appropriate provider", async () => {
    const baseConfig = {
      assetId: "asset-123",
      regulationType: RegulationType.MICA,
      status: RegulationStatus.COMPLIANT,
    };
    const specificConfig = { documents: [] };

    const result = await createRegulation(baseConfig, specificConfig);

    expect(result).toBe("mock-id");
    expect(mockProvider.create).toHaveBeenCalledWith(
      baseConfig,
      specificConfig
    );
  });

  test("updateRegulation calls the appropriate provider", async () => {
    const id = "regulation-123";
    const baseConfig = { status: RegulationStatus.NOT_COMPLIANT };
    const regulationType = RegulationType.MICA;
    const specificConfig = { documents: [] };

    await updateRegulation(id, baseConfig, regulationType, specificConfig);

    expect(mockProvider.update).toHaveBeenCalledWith(
      id,
      baseConfig,
      specificConfig
    );
  });

  test("getRegulationById calls the appropriate provider", async () => {
    const id = "regulation-123";
    const regulationType = RegulationType.MICA;

    const result = await getRegulationById(id, regulationType);

    expect(result).toBeTruthy();
    expect(mockProvider.getById).toHaveBeenCalledWith(id);
  });

  test("getRegulationsByAssetId calls the appropriate provider", async () => {
    const assetId = "asset-123";
    const regulationType = RegulationType.MICA;

    const result = await getRegulationsByAssetId(assetId, regulationType);

    expect(result).toHaveLength(1);
    expect(mockProvider.getByAssetId).toHaveBeenCalledWith(assetId);
  });
});
