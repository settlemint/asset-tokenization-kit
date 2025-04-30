/**
 * Tests for MICA regulation provider implementation
 */
import {
  type MicaDocument,
  type MicaRegulationConfig,
} from "@/lib/db/regulations/schema-mica-regulation-configs";
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { MicaRegulationProvider } from "./mica-regulation-provider";

// Mock database operations
const mockInsert = mock(() => ({
  values: mock(() => Promise.resolve()),
}));

const mockUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => Promise.resolve()),
  })),
}));

const mockSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      execute: mock(() => []),
    })),
  })),
}));

// Mock the db module
mock.module("@/lib/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  },
}));

// Mock transaction
const mockTx = {
  insert: mockInsert,
  update: mockUpdate,
  select: mockSelect,
};

describe("MICA Regulation Provider", () => {
  let provider: MicaRegulationProvider;

  beforeEach(() => {
    provider = new MicaRegulationProvider();
    // Clear any mock records
    mock.restore();
  });

  describe("createTypeSpecificConfig", () => {
    test("successfully creates a MICA configuration", async () => {
      const regulationConfigId = "test-regulation-id";
      const specificConfig = {
        documents: [] as MicaDocument[],
        reserveComposition: {
          bankDeposits: 50,
          governmentBonds: 30,
          highQualityLiquidAssets: 10,
          corporateBonds: 5,
          centralBankAssets: 5,
          commodities: 0,
          otherAssets: 0,
        },
        tokenType: "e-money",
        whitePaper: "white-paper-url",
        publishDate: new Date(),
      };

      await provider["createTypeSpecificConfig"](
        mockTx,
        regulationConfigId,
        specificConfig
      );

      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe("updateTypeSpecificConfig", () => {
    test("throws error when MICA config doesn't exist", async () => {
      const regulationConfigId = "non-existent-id";
      const specificConfig = {
        documents: [] as MicaDocument[],
        tokenType: "e-money-token",
      };

      // Configure mock to return empty array (no existing config)
      mockSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => ({
            execute: mock(() => []),
          })),
        })),
      }));

      await expect(
        provider["updateTypeSpecificConfig"](
          mockTx,
          regulationConfigId,
          specificConfig
        )
      ).rejects.toThrow(
        `MICA config not found for regulation config ID: ${regulationConfigId}`
      );
    });

    test("successfully updates an existing MICA configuration", async () => {
      const regulationConfigId = "existing-id";
      const specificConfig = {
        documents: [] as MicaDocument[],
        tokenType: "asset-referenced-token",
      };

      // Configure mock to return a config
      mockSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => ({
            execute: mock(() => [{ configId: "existing-mica-id" }]),
          })),
        })),
      }));

      await provider["updateTypeSpecificConfig"](
        mockTx,
        regulationConfigId,
        specificConfig
      );

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe("getTypeSpecificConfig", () => {
    test("returns undefined when no MICA config exists", async () => {
      const regulationConfigId = "test-regulation-id";

      // Configure mock to return empty array
      mockSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => ({
            execute: mock(() => []),
          })),
        })),
      }));

      const result =
        await provider["getTypeSpecificConfig"](regulationConfigId);
      expect(result).toBeUndefined();
    });

    test("returns MICA config when it exists", async () => {
      const regulationConfigId = "test-regulation-id";
      // Mock using as unknown to bypass type checking for test
      const micaConfig = {
        id: "mica-id",
        regulationConfigId,
        // Include only what's needed for the test
        documents: null,
        reserveComposition: {
          bankDeposits: 50,
          governmentBonds: 30,
          highQualityLiquidAssets: 10,
          corporateBonds: 5,
          centralBankAssets: 5,
        },
      } as unknown as MicaRegulationConfig;

      // Configure mock to return the config
      mockSelect.mockImplementation(() => ({
        from: mock(() => ({
          where: mock(() => ({
            execute: mock(() => [micaConfig]),
          })),
        })),
      }));

      const result =
        await provider["getTypeSpecificConfig"](regulationConfigId);
      expect(result).toEqual(micaConfig);
    });
  });
});
