import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaseActionSheet } from "./base-action-sheet";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/web3/web3-address", () => ({
  Web3Address: ({ address }: { address: string }) => (
    <span data-testid="web3-address">{address}</span>
  ),
}));

const createMockToken = (overrides?: Partial<Token>): Token =>
  ({
    id: "0x1234567890123456789012345678901234567890",
    name: "Test Token",
    symbol: "TEST",
    decimals: 18,
    totalSupply: [1000000n, 18],
    type: "bond",
    createdAt: 1234567890,
    extensions: [],
    implementsERC3643: true,
    implementsSMART: true,
    pausable: { paused: false },
    capped: null,
    createdBy: { id: "0xowner" },
    redeemable: null,
    bond: null,
    fund: null,
    collateral: null,
    accessControl: undefined,
    userPermissions: undefined,
    ...overrides,
  }) as Token;

describe("BaseActionSheet", () => {
  const user = userEvent.setup();
  const mockOnOpenChange = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders sheet with title and description", () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test Action"
          description="Test description"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText("Test Action")).toBeInTheDocument();
      expect(screen.getByText("Test description")).toBeInTheDocument();
    });

    it("renders children content", () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
        >
          <div data-testid="child-content">Child Content</div>
        </BaseActionSheet>
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Child Content")).toBeInTheDocument();
    });

    it("renders submit button", () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button data-testid="submit-btn">Custom Submit</button>}
          onCancel={mockOnCancel}
        />
      );

      const submitBtn = screen.getByTestId("submit-btn");
      expect(submitBtn).toBeInTheDocument();
      expect(submitBtn).toHaveTextContent("Custom Submit");
    });

    it("renders cancel button", () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
        />
      );

      const cancelBtn = screen.getByRole("button", {
        name: /common:actions.cancel/i,
      });
      expect(cancelBtn).toBeInTheDocument();
    });

    it("does not render when open is false", () => {
      const asset = createMockToken();
      const { container } = render(
        <BaseActionSheet
          open={false}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test Action"
          description="Test description"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
        />
      );

      // Sheet content should not be visible
      expect(screen.queryByText("Test Action")).not.toBeInTheDocument();
    });
  });

  describe("Asset Details", () => {
    it("shows asset details when showAssetDetails is true", () => {
      const asset = createMockToken({
        name: "My Token",
        symbol: "MTK",
        id: "0xabcdef1234567890123456789012345678901234",
      });

      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
          showAssetDetails={true}
        />
      );

      // Check for asset details card
      expect(screen.getByText("tokens:details.title")).toBeInTheDocument();
      expect(screen.getByText("My Token (MTK)")).toBeInTheDocument();
      expect(screen.getByTestId("web3-address")).toHaveTextContent(
        "0xabcdef1234567890123456789012345678901234"
      );
    });

    it("does not show asset details when showAssetDetails is false", () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
          showAssetDetails={false}
        />
      );

      expect(
        screen.queryByText("tokens:details.title")
      ).not.toBeInTheDocument();
    });

    it("does not show asset details by default", () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.queryByText("tokens:details.title")
      ).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("calls onCancel when cancel button is clicked", async () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
        />
      );

      const cancelBtn = screen.getByRole("button", {
        name: /common:actions.cancel/i,
      });
      await user.click(cancelBtn);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("calls onOpenChange with false when sheet is closed", async () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
        />
      );

      // Find and click the close button (X button in sheet)
      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("disables cancel button when isSubmitting is true", () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
          isSubmitting={true}
        />
      );

      const cancelBtn = screen.getByRole("button", {
        name: /common:actions.cancel/i,
      });
      expect(cancelBtn).toBeDisabled();
    });

    it("enables cancel button when isSubmitting is false", () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const cancelBtn = screen.getByRole("button", {
        name: /common:actions.cancel/i,
      });
      expect(cancelBtn).not.toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined children gracefully", () => {
      const asset = createMockToken();
      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
          children={undefined}
        />
      );

      // Should render without errors
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("handles complex submit elements", () => {
      const asset = createMockToken();
      const ComplexSubmit = () => (
        <div data-testid="complex-submit">
          <button>Primary Action</button>
          <button>Secondary Action</button>
        </div>
      );

      render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
          title="Test"
          description="Test"
          submit={<ComplexSubmit />}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId("complex-submit")).toBeInTheDocument();
      expect(screen.getByText("Primary Action")).toBeInTheDocument();
      expect(screen.getByText("Secondary Action")).toBeInTheDocument();
    });

    it("maintains sheet state when asset changes", () => {
      const asset1 = createMockToken({ name: "Token 1" });
      const asset2 = createMockToken({ name: "Token 2" });

      const { rerender } = render(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset1}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
          showAssetDetails={true}
        />
      );

      expect(screen.getByText("Token 1 (TEST)")).toBeInTheDocument();

      rerender(
        <BaseActionSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset2}
          title="Test"
          description="Test"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
          showAssetDetails={true}
        />
      );

      expect(screen.getByText("Token 2 (TEST)")).toBeInTheDocument();
    });
  });
});
