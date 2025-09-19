import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAssetDesignerSteps } from "./use-asset-designer-steps";

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("useAssetDesignerSteps", () => {
  describe("Asset-Specific Step Inclusion", () => {
    describe("Bond asset", () => {
      it("should include assetSpecificConfig step for bond", () => {
        const { result } = renderHook(() =>
          useAssetDesignerSteps({ type: "bond" })
        );

        const configureGroup = result.current.stepsOrGroups.find(
          (g) => g.id === "configureAssetDetails"
        );

        expect(configureGroup).toBeDefined();
        expect(configureGroup!.steps).toHaveLength(2);

        const assetSpecificStep = configureGroup!.steps.find(
          (s) => s.id === "assetSpecificConfig"
        );
        expect(assetSpecificStep).toBeDefined();
        expect(assetSpecificStep!.step).toBe(4);
      });
    });

    describe("Fund asset", () => {
      it("should include assetSpecificConfig step for fund", () => {
        const { result } = renderHook(() =>
          useAssetDesignerSteps({ type: "fund" })
        );

        const configureGroup = result.current.stepsOrGroups.find(
          (g) => g.id === "configureAssetDetails"
        );

        expect(configureGroup).toBeDefined();
        expect(configureGroup!.steps).toHaveLength(2);

        const assetSpecificStep = configureGroup!.steps.find(
          (s) => s.id === "assetSpecificConfig"
        );
        expect(assetSpecificStep).toBeDefined();
        expect(assetSpecificStep!.step).toBe(4);
      });
    });

    describe("Equity asset", () => {
      it("should include assetSpecificConfig step for equity", () => {
        const { result } = renderHook(() =>
          useAssetDesignerSteps({ type: "equity" })
        );

        const configureGroup = result.current.stepsOrGroups.find(
          (g) => g.id === "configureAssetDetails"
        );

        expect(configureGroup).toBeDefined();
        expect(configureGroup!.steps).toHaveLength(2);

        const assetSpecificStep = configureGroup!.steps.find(
          (s) => s.id === "assetSpecificConfig"
        );
        expect(assetSpecificStep).toBeDefined();
        expect(assetSpecificStep!.step).toBe(4);
      });
    });

    describe("Stablecoin asset", () => {
      it("should NOT include assetSpecificConfig step for stablecoin", () => {
        const { result } = renderHook(() =>
          useAssetDesignerSteps({ type: "stablecoin" })
        );

        const configureGroup = result.current.stepsOrGroups.find(
          (g) => g.id === "configureAssetDetails"
        );

        expect(configureGroup).toBeDefined();
        expect(configureGroup!.steps).toHaveLength(1);

        const assetSpecificStep = configureGroup!.steps.find(
          (s) => s.id === "assetSpecificConfig"
        );
        expect(assetSpecificStep).toBeUndefined();
      });
    });

    describe("Deposit asset", () => {
      it("should NOT include assetSpecificConfig step for deposit", () => {
        const { result } = renderHook(() =>
          useAssetDesignerSteps({ type: "deposit" })
        );

        const configureGroup = result.current.stepsOrGroups.find(
          (g) => g.id === "configureAssetDetails"
        );

        expect(configureGroup).toBeDefined();
        expect(configureGroup!.steps).toHaveLength(1);

        const assetSpecificStep = configureGroup!.steps.find(
          (s) => s.id === "assetSpecificConfig"
        );
        expect(assetSpecificStep).toBeUndefined();
      });
    });
  });
});
