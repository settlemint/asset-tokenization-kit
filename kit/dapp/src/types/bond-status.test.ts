/**
 * @vitest-environment node
 */
import type { StatsBondStatusOutput } from "@/orpc/routes/token/routes/stats/bond-status.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { from } from "dnum";
import type { TFunction } from "i18next";
import { describe, expect, test } from "vitest";
import type {
  BondChartData,
  BondDisplayData,
  BondFooterData,
  BondProgressData,
  BondStatus,
  BondStatusStrategy,
} from "./bond-status";

describe("bond-status types", () => {
  describe("BondStatus", () => {
    test("should accept valid bond status values", () => {
      const issuingStatus: BondStatus = "issuing";
      const activeStatus: BondStatus = "active";
      const maturedStatus: BondStatus = "matured";

      expect(issuingStatus).toBe("issuing");
      expect(activeStatus).toBe("active");
      expect(maturedStatus).toBe("matured");
    });

    test("should be used as discriminated union", () => {
      function testStatus(status: BondStatus): void {
        switch (status) {
          case "issuing":
            expect(status).toBe("issuing");
            break;
          case "active":
            expect(status).toBe("active");
            break;
          case "matured":
            expect(status).toBe("matured");
            break;
          default: {
            // This ensures exhaustive type checking
            const _exhaustive: never = status;
            throw new Error(`Unhandled status: ${_exhaustive}`);
          }
        }
      }

      testStatus("active");
      testStatus("issuing");
      testStatus("matured");
    });
  });

  describe("BondProgressData", () => {
    test("should create valid BondProgressData object", () => {
      const progressData: BondProgressData = {
        progress: 75.5,
        status: "active",
      };

      expect(progressData.progress).toBe(75.5);
      expect(progressData.status).toBe("active");
    });

    test("should handle edge cases for progress values", () => {
      const zeroProgress: BondProgressData = {
        progress: 0,
        status: "issuing",
      };

      const fullProgress: BondProgressData = {
        progress: 100,
        status: "matured",
      };

      const negativeProgress: BondProgressData = {
        progress: -10,
        status: "active",
      };

      const infinityProgress: BondProgressData = {
        progress: Infinity,
        status: "active",
      };

      const nanProgress: BondProgressData = {
        progress: Number.NaN,
        status: "active",
      };

      expect(zeroProgress.progress).toBe(0);
      expect(fullProgress.progress).toBe(100);
      expect(negativeProgress.progress).toBe(-10);
      expect(infinityProgress.progress).toBe(Infinity);
      expect(nanProgress.progress).toBeNaN();
    });
  });

  describe("BondDisplayData", () => {
    test("should create valid BondDisplayData object", () => {
      const displayData: BondDisplayData = {
        title: "Active Bond",
        description: "This bond is currently active",
        color: "#00FF00",
        label: "Active",
      };

      expect(displayData.title).toBe("Active Bond");
      expect(displayData.description).toBe("This bond is currently active");
      expect(displayData.color).toBe("#00FF00");
      expect(displayData.label).toBe("Active");
    });

    test("should handle empty strings", () => {
      const emptyDisplayData: BondDisplayData = {
        title: "",
        description: "",
        color: "",
        label: "",
      };

      expect(emptyDisplayData.title).toBe("");
      expect(emptyDisplayData.description).toBe("");
      expect(emptyDisplayData.color).toBe("");
      expect(emptyDisplayData.label).toBe("");
    });
  });

  describe("BondFooterData", () => {
    test("should create valid BondFooterData object", () => {
      const footerData: BondFooterData = {
        progress: 50,
        label: "50% Complete",
      };

      expect(footerData.progress).toBe(50);
      expect(footerData.label).toBe("50% Complete");
    });

    test("should handle decimal progress values", () => {
      const footerData: BondFooterData = {
        progress: 33.333,
        label: "33.33% Complete",
      };

      expect(footerData.progress).toBe(33.333);
      expect(footerData.label).toBe("33.33% Complete");
    });

    test("should handle various progress values", () => {
      const zeroProgress: BondFooterData = {
        progress: 0,
        label: "0% Complete",
      };
      const fullProgress: BondFooterData = {
        progress: 100,
        label: "100% Complete",
      };
      const negativeProgress: BondFooterData = {
        progress: -10,
        label: "-10% Complete",
      };

      expect(zeroProgress.progress).toBe(0);
      expect(fullProgress.progress).toBe(100);
      expect(negativeProgress.progress).toBe(-10);
    });
  });

  describe("BondChartData", () => {
    test("should create valid BondChartData object with all fields", () => {
      const chartData: BondChartData = {
        data: [
          { name: "completed", value: 75, fill: "#00FF00" },
          { name: "remaining", value: 25, fill: "#FF0000" },
        ],
        config: {
          completed: { color: "#00FF00" },
          remaining: { color: "#FF0000" },
        },
        title: "Bond Progress",
        description: "Current bond status",
        footerData: {
          progress: 75,
          label: "75% Complete",
        },
        progress: 75,
        status: "active",
        isEmpty: false,
      };

      expect(chartData.data).toHaveLength(2);
      expect(chartData.data[0]).toEqual({
        name: "completed",
        value: 75,
        fill: "#00FF00",
      });
      expect(chartData.config).toHaveProperty("completed");
      expect(chartData.title).toBe("Bond Progress");
      expect(chartData.description).toBe("Current bond status");
      expect(chartData.footerData).toEqual({
        progress: 75,
        label: "75% Complete",
      });
      expect(chartData.progress).toBe(75);
      expect(chartData.status).toBe("active");
      expect(chartData.isEmpty).toBe(false);
    });

    test("should handle null footerData", () => {
      const chartData: BondChartData = {
        data: [],
        config: {},
        title: "Empty Bond",
        description: "No data available",
        footerData: null,
        progress: 0,
        status: "issuing",
        isEmpty: true,
      };

      expect(chartData.footerData).toBeNull();
      expect(chartData.isEmpty).toBe(true);
    });

    test("should handle empty data array", () => {
      const chartData: BondChartData = {
        data: [],
        config: {},
        title: "No Data",
        description: "No chart data",
        footerData: null,
        progress: 0,
        status: "issuing",
        isEmpty: true,
      };

      expect(chartData.data).toHaveLength(0);
      expect(chartData.isEmpty).toBe(true);
    });
  });

  describe("BondStatusStrategy", () => {
    test("should implement BondStatusStrategy interface", () => {
      // Mock implementation of the strategy
      const mockStrategy: BondStatusStrategy = {
        calculateProgress: () => {
          return {
            progress: 50,
            status: "active",
          };
        },
        getDisplayData: (_, progress) => {
          return {
            title: "Active Bond",
            description: "Bond is active",
            color: "#00FF00",
            label: `${progress}%`,
          };
        },
      };

      // Test calculateProgress method
      const mockToken: Token = {
        id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        type: "bond",
        createdAt: new Date(),
        name: "Test Bond",
        symbol: "TBD",
        decimals: 18,
        totalSupply: from(1_000_000),
        extensions: [],
        implementsERC3643: true,
        implementsSMART: false,
        pausable: { paused: false },
        collateral: null,
        capped: null,
        createdBy: {
          id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        },
        identity: {
          id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          account: {
            id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          },
          isContract: false,
          claims: [],
          registered: undefined,
        },
        redeemable: null,
        bond: {
          faceValue: from(1000),
          isMatured: false,
          maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          denominationAssetNeeded: from(0),
          denominationAsset: {
            id: "0x0000000000000000000000000000000000000001" as `0x${string}`,
            decimals: 18,
            symbol: "USDC",
          },
        },
        fund: null,
        yield: null,
        complianceModuleConfigs: [],
        stats: null,
      };
      const mockBondStatus: StatsBondStatusOutput = {
        denominationAssetBalanceAvailable: from(500),
        denominationAssetBalanceRequired: from(1000),
        coveredPercentage: from(50),
      };
      const progressResult = mockStrategy.calculateProgress(
        mockToken,
        mockBondStatus
      );

      expect(progressResult).toEqual({
        progress: 50,
        status: "active",
      });

      // Test getDisplayData method
      const mockT = ((key: string) => key) as TFunction<
        readonly ["stats", "tokens"]
      >;
      const displayResult = mockStrategy.getDisplayData(mockT, 75);

      expect(displayResult.title).toBe("Active Bond");
      expect(displayResult.description).toBe("Bond is active");
      expect(displayResult.color).toBe("#00FF00");
      expect(displayResult.label).toBe("75%");
    });

    test("should handle multiple strategy implementations", () => {
      // Issuing strategy
      const issuingStrategy: BondStatusStrategy = {
        calculateProgress: () => ({
          progress: 25,
          status: "issuing",
        }),
        getDisplayData: (__, progress) => ({
          title: "Issuing",
          description: "Bond is being issued",
          color: "#FFA500",
          label: `${progress}% Issued`,
        }),
      };

      // Active strategy
      const activeStrategy: BondStatusStrategy = {
        calculateProgress: () => ({
          progress: 60,
          status: "active",
        }),
        getDisplayData: (__, progress) => ({
          title: "Active",
          description: "Bond is active",
          color: "#00FF00",
          label: `${progress}% Complete`,
        }),
      };

      // Matured strategy
      const maturedStrategy: BondStatusStrategy = {
        calculateProgress: () => ({
          progress: 100,
          status: "matured",
        }),
        getDisplayData: (__, _progress) => ({
          title: "Matured",
          description: "Bond has matured",
          color: "#0000FF",
          label: "Fully Matured",
        }),
      };

      // Test each strategy
      const mockToken: Token = {
        id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        type: "bond",
        createdAt: new Date(),
        name: "Test Bond",
        symbol: "TBD",
        decimals: 18,
        totalSupply: from(1_000_000),
        extensions: [],
        implementsERC3643: true,
        implementsSMART: false,
        pausable: { paused: false },
        collateral: null,
        capped: null,
        createdBy: {
          id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        },
        identity: {
          id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          account: {
            id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          },
          isContract: false,
          claims: [],
          registered: undefined,
        },
        redeemable: null,
        bond: {
          faceValue: from(1000),
          isMatured: false,
          maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          denominationAssetNeeded: from(0),
          denominationAsset: {
            id: "0x0000000000000000000000000000000000000001" as `0x${string}`,
            decimals: 18,
            symbol: "USDC",
          },
        },
        fund: null,
        yield: null,
        complianceModuleConfigs: [],
        stats: null,
      };
      const mockBondStatus: StatsBondStatusOutput = {
        denominationAssetBalanceAvailable: from(500),
        denominationAssetBalanceRequired: from(1000),
        coveredPercentage: from(50),
      };
      const mockT = ((key: string) => key) as TFunction<
        readonly ["stats", "tokens"]
      >;

      const issuingProgress = issuingStrategy.calculateProgress(
        mockToken,
        mockBondStatus
      );
      expect(issuingProgress.status).toBe("issuing");
      expect(issuingProgress.progress).toBe(25);
      const issuingDisplay = issuingStrategy.getDisplayData(
        mockT,
        issuingProgress.progress
      );
      expect(issuingDisplay.title).toBe("Issuing");

      const activeProgress = activeStrategy.calculateProgress(
        mockToken,
        mockBondStatus
      );
      expect(activeProgress.status).toBe("active");
      expect(activeProgress.progress).toBe(60);
      const activeDisplay = activeStrategy.getDisplayData(
        mockT,
        activeProgress.progress
      );
      expect(activeDisplay.title).toBe("Active");

      const maturedProgress = maturedStrategy.calculateProgress(
        mockToken,
        mockBondStatus
      );
      expect(maturedProgress.status).toBe("matured");
      expect(maturedProgress.progress).toBe(100);
      const maturedDisplay = maturedStrategy.getDisplayData(
        mockT,
        maturedProgress.progress
      );
      expect(maturedDisplay.title).toBe("Matured");
    });
  });

  describe("Type composition and relationships", () => {
    test("should compose types correctly in a complete flow for active status", () => {
      // Simulate a complete bond status calculation flow
      const mockStrategy: BondStatusStrategy = {
        calculateProgress: () => {
          const progressData: BondProgressData = {
            progress: 80,
            status: "active",
          };
          return progressData;
        },
        getDisplayData: (_) => {
          const displayData: BondDisplayData = {
            title: "Active Bond",
            description: "80% complete",
            color: "#00FF00",
            label: "80%",
          };
          return displayData;
        },
      };

      // Calculate progress
      const mockTokenForCalc: Token = {
        id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        type: "bond",
        createdAt: new Date(),
        name: "Test Bond",
        symbol: "TBD",
        decimals: 18,
        totalSupply: from(1_000_000),
        extensions: [],
        implementsERC3643: true,
        implementsSMART: false,
        pausable: { paused: false },
        collateral: null,
        capped: null,
        createdBy: {
          id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        },
        identity: {
          id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          account: {
            id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          },
          isContract: false,
          claims: [],
          registered: undefined,
        },
        redeemable: null,
        bond: {
          faceValue: from(1000),
          isMatured: false,
          maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          denominationAssetNeeded: from(0),
          denominationAsset: {
            id: "0x0000000000000000000000000000000000000001" as `0x${string}`,
            decimals: 18,
            symbol: "USDC",
          },
        },
        fund: null,
        yield: null,
        complianceModuleConfigs: [],
        stats: null,
      };
      const mockBondStatusForCalc: StatsBondStatusOutput = {
        denominationAssetBalanceAvailable: from(800),
        denominationAssetBalanceRequired: from(1000),
        coveredPercentage: from(80),
      };
      const progressData = mockStrategy.calculateProgress(
        mockTokenForCalc,
        mockBondStatusForCalc
      );

      // Get display data
      const displayData = mockStrategy.getDisplayData(
        ((key: string) => key) as TFunction<readonly ["stats", "tokens"]>,
        progressData.progress
      );

      // Create footer data
      const footerData: BondFooterData = {
        progress: progressData.progress,
        label: displayData.label,
      };

      // Compose into chart data
      const chartData: BondChartData = {
        data: [
          {
            name: "completed",
            value: progressData.progress,
            fill: displayData.color,
          },
          {
            name: "remaining",
            value: 100 - progressData.progress,
            fill: "#CCCCCC",
          },
        ],
        config: {
          completed: { color: displayData.color },
          remaining: { color: "#CCCCCC" },
        },
        title: displayData.title,
        description: displayData.description,
        footerData: footerData,
        progress: progressData.progress,
        status: progressData.status,
        isEmpty: false,
      };

      // Verify the complete data structure
      expect(chartData.progress).toBe(80);
      expect(chartData.status).toBe("active");
      expect(chartData.title).toBe("Active Bond");
      expect(chartData.data[0]?.value).toBe(80);
      expect(chartData.data[1]?.value).toBe(20);
      expect(chartData.footerData?.progress).toBe(80);
      expect(chartData.footerData?.label).toBe("80%");
    });

    test("should compose types correctly for matured status", () => {
      const mockStrategy: BondStatusStrategy = {
        calculateProgress: () => ({
          progress: 100,
          status: "matured",
        }),
        getDisplayData: (__, _progress) => ({
          title: "Matured Bond",
          description: "Fully matured",
          color: "#0000FF",
          label: "100%",
        }),
      };

      const mockToken: Token = {
        id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        type: "bond",
        createdAt: new Date(),
        name: "Test Bond",
        symbol: "TBD",
        decimals: 18,
        totalSupply: from(1_000_000),
        extensions: [],
        implementsERC3643: true,
        implementsSMART: false,
        pausable: { paused: false },
        collateral: null,
        capped: null,
        createdBy: {
          id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        },
        identity: {
          id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          account: {
            id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          },
          isContract: false,
          claims: [],
          registered: undefined,
        },
        redeemable: null,
        bond: {
          faceValue: from(1000),
          isMatured: true,
          maturityDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          denominationAssetNeeded: from(0),
          denominationAsset: {
            id: "0x0000000000000000000000000000000000000001" as `0x${string}`,
            decimals: 18,
            symbol: "USDC",
          },
        },
        fund: null,
        yield: null,
        complianceModuleConfigs: [],
        stats: null,
      };
      const mockBondStatus: StatsBondStatusOutput = {
        denominationAssetBalanceAvailable: from(1000),
        denominationAssetBalanceRequired: from(1000),
        coveredPercentage: from(100),
      };
      const progressData = mockStrategy.calculateProgress(
        mockToken,
        mockBondStatus
      );
      const displayData = mockStrategy.getDisplayData(
        ((k: string) => k) as TFunction<readonly ["stats", "tokens"]>,
        progressData.progress
      );
      const footerData: BondFooterData = {
        progress: progressData.progress,
        label: displayData.label,
      };

      const chartData: BondChartData = {
        data: [
          {
            name: "completed",
            value: progressData.progress,
            fill: displayData.color,
          },
          {
            name: "remaining",
            value: 100 - progressData.progress,
            fill: "#CCCCCC",
          },
        ],
        config: {
          completed: { color: displayData.color },
          remaining: { color: "#CCCCCC" },
        },
        title: displayData.title,
        description: displayData.description,
        footerData,
        progress: progressData.progress,
        status: progressData.status,
        isEmpty: false,
      };

      expect(chartData.progress).toBe(100);
      expect(chartData.status).toBe("matured");
      expect(chartData.title).toBe("Matured Bond");
      expect(chartData.data[0]?.value).toBe(100);
      expect(chartData.data[1]?.value).toBe(0);
    });
  });
});
