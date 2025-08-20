import type { AssetType } from "@atk/zod/asset-types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TokenFactoryRelated } from "./token-factory-related";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "en",
    },
    ready: true,
  }),
}));

describe("TokenFactoryRelated", () => {
  const assetTypes: AssetType[] = [
    "bond",
    "deposit",
    "equity",
    "fund",
    "stablecoin",
  ];

  describe("Structure and Layout", () => {
    it("should render with all required components", () => {
      render(<TokenFactoryRelated assetType="equity" />);

      // Check for the 3 grid items
      const gridItems = document.querySelectorAll(
        '[data-slot="related-grid-item"]'
      );
      expect(gridItems).toHaveLength(3);

      // Check for titles
      expect(
        screen.getByText("factory.related.equity.box1.title")
      ).toBeInTheDocument();
      expect(
        screen.getByText("factory.related.equity.box2.title")
      ).toBeInTheDocument();
      expect(
        screen.getByText("factory.related.equity.box3.title")
      ).toBeInTheDocument();

      // Check for descriptions
      expect(
        screen.getByText("factory.related.equity.box1.description")
      ).toBeInTheDocument();
      expect(
        screen.getByText("factory.related.equity.box2.description")
      ).toBeInTheDocument();
      expect(
        screen.getByText("factory.related.equity.box3.description")
      ).toBeInTheDocument();

      // Check for buttons
      expect(
        screen.getByText("factory.related.equity.box1.button")
      ).toBeInTheDocument();
      expect(
        screen.getByText("factory.related.equity.box2.button")
      ).toBeInTheDocument();
      expect(
        screen.getByText("factory.related.equity.box3.button")
      ).toBeInTheDocument();
    });

    it("should render with animation enabled on content", () => {
      const { container } = render(<TokenFactoryRelated assetType="bond" />);
      const gridContent = container.querySelector(
        '[data-slot="related-grid-content"]'
      );
      expect(gridContent).toBeInTheDocument();

      // Check that grid items have animation class
      const gridItems = container.querySelectorAll(
        '[data-slot="related-grid-item"]'
      );
      gridItems.forEach((item) => {
        expect(item).toHaveClass("animate-in-grid");
      });
    });

    it("should render with 3 columns layout", () => {
      const { container } = render(
        <TokenFactoryRelated assetType="stablecoin" />
      );
      const gridContent = container.querySelector(
        '[data-slot="related-grid-content"]'
      );
      expect(gridContent).toHaveClass("lg:grid-cols-3");
    });
  });

  describe("Asset Type Variations", () => {
    assetTypes.forEach((assetType) => {
      it(`should render correct translation keys for ${assetType}`, () => {
        const { container } = render(
          <TokenFactoryRelated assetType={assetType} />
        );

        // First ensure component renders
        const gridItems = container.querySelectorAll(
          '[data-slot="related-grid-item"]'
        );
        expect(gridItems).toHaveLength(3);

        // Verify all translation keys are properly formed for this asset type
        // Using more flexible text matching to handle potential rendering issues
        const box1Title = screen.queryByText(
          `factory.related.${assetType}.box1.title`
        );
        const box1Desc = screen.queryByText(
          `factory.related.${assetType}.box1.description`
        );
        const box1Btn = screen.queryByText(
          `factory.related.${assetType}.box1.button`
        );

        expect(box1Title).toBeInTheDocument();
        expect(box1Desc).toBeInTheDocument();
        expect(box1Btn).toBeInTheDocument();

        const box2Title = screen.queryByText(
          `factory.related.${assetType}.box2.title`
        );
        const box2Desc = screen.queryByText(
          `factory.related.${assetType}.box2.description`
        );
        const box2Btn = screen.queryByText(
          `factory.related.${assetType}.box2.button`
        );

        expect(box2Title).toBeInTheDocument();
        expect(box2Desc).toBeInTheDocument();
        expect(box2Btn).toBeInTheDocument();

        const box3Title = screen.queryByText(
          `factory.related.${assetType}.box3.title`
        );
        const box3Desc = screen.queryByText(
          `factory.related.${assetType}.box3.description`
        );
        const box3Btn = screen.queryByText(
          `factory.related.${assetType}.box3.button`
        );

        expect(box3Title).toBeInTheDocument();
        expect(box3Desc).toBeInTheDocument();
        expect(box3Btn).toBeInTheDocument();
      });
    });
  });

  describe("Button Styling", () => {
    it("should apply correct button variant and size", () => {
      render(<TokenFactoryRelated assetType="fund" />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);

      buttons.forEach((button) => {
        // Check for variant="outline" and size="sm" classes
        expect(button).toHaveClass("border", "bg-background", "h-8");
        // Check for press-effect animation class
        expect(button).toHaveClass("press-effect");
      });
    });
  });

  describe("Component Integration", () => {
    it("should use RelatedGrid compound components correctly", () => {
      const { container } = render(<TokenFactoryRelated assetType="deposit" />);

      // Check main grid container
      expect(
        container.querySelector('[data-slot="related-grid"]')
      ).toBeInTheDocument();

      // Check grid content
      expect(
        container.querySelector('[data-slot="related-grid-content"]')
      ).toBeInTheDocument();

      // Check all grid items
      const gridItems = container.querySelectorAll(
        '[data-slot="related-grid-item"]'
      );
      expect(gridItems).toHaveLength(3);

      // Check item structure
      gridItems.forEach((item) => {
        const content = item.querySelector(
          '[data-slot="related-grid-item-content"]'
        );
        const footer = item.querySelector(
          '[data-slot="related-grid-item-footer"]'
        );
        expect(content).toBeInTheDocument();
        expect(footer).toBeInTheDocument();
      });
    });

    it("should render items with gradient variant by default", () => {
      const { container } = render(<TokenFactoryRelated assetType="bond" />);

      const gridItems = container.querySelectorAll(
        '[data-slot="related-grid-item"]'
      );
      gridItems.forEach((item) => {
        expect(item).toHaveClass("linear-gradient-related");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button elements", () => {
      render(<TokenFactoryRelated assetType="equity" />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);

      // Each button should have accessible text
      buttons.forEach((button, index) => {
        expect(button).toHaveTextContent(
          `factory.related.equity.box${index + 1}.button`
        );
      });
    });

    it("should maintain proper heading hierarchy", () => {
      render(<TokenFactoryRelated assetType="stablecoin" />);

      // RelatedGridItemTitle renders as h3 by default
      const headings = document.querySelectorAll("h3");
      expect(headings).toHaveLength(3);
    });
  });
});
