import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaseActionSheet, ActionSheetFooter } from "./base-action-sheet";
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
    id: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    name: "Test Token",
    symbol: "TEST",
    decimals: 18,
    totalSupply: [1_000_000n, 18] as [bigint, number],
    type: "bond" as const,
    createdAt: new Date(1_234_567_890),
    extensions: [],
    implementsERC3643: true,
    implementsSMART: true,
    pausable: { paused: false },
    capped: null,
    createdBy: { id: "0xowner" },
    redeemable: null,
    bond: null,
    fund: null,
    yield: null,
    collateral: null,
    accessControl: undefined,
    userPermissions: undefined,
    ...overrides,
  }) as Token;

describe("ActionSheetFooter", () => {
  const user = userEvent.setup();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders cancel button and children", () => {
    render(
      <ActionSheetFooter onCancel={mockOnCancel}>
        <button>Submit</button>
      </ActionSheetFooter>
    );

    expect(screen.getByText("common:actions.cancel")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    render(
      <ActionSheetFooter onCancel={mockOnCancel}>
        <button>Submit</button>
      </ActionSheetFooter>
    );

    const cancelButton = screen.getByText("common:actions.cancel");
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("disables cancel button when isSubmitting is true", () => {
    render(
      <ActionSheetFooter onCancel={mockOnCancel} isSubmitting={true}>
        <button>Submit</button>
      </ActionSheetFooter>
    );

    const cancelButton = screen.getByText("common:actions.cancel");
    expect(cancelButton).toBeDisabled();
  });

  it("enables cancel button when isSubmitting is false", () => {
    render(
      <ActionSheetFooter onCancel={mockOnCancel} isSubmitting={false}>
        <button>Submit</button>
      </ActionSheetFooter>
    );

    const cancelButton = screen.getByText("common:actions.cancel");
    expect(cancelButton).not.toBeDisabled();
  });

  it("uses custom cancel label when provided", () => {
    render(
      <ActionSheetFooter onCancel={mockOnCancel} cancelLabel="Custom Cancel">
        <button>Submit</button>
      </ActionSheetFooter>
    );

    expect(screen.getByText("Custom Cancel")).toBeInTheDocument();
    expect(screen.queryByText("common:actions.cancel")).not.toBeInTheDocument();
  });

  it("has correct layout structure", () => {
    const { container } = render(
      <ActionSheetFooter onCancel={mockOnCancel}>
        <button data-testid="submit-btn">Submit</button>
      </ActionSheetFooter>
    );

    // Check for the overall structure
    const cancelButton = screen.getByText("common:actions.cancel");
    const submitButton = screen.getByTestId("submit-btn");

    // Both buttons should be present
    expect(cancelButton).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    // Check that cancel button has correct classes
    expect(cancelButton).toHaveClass("press-effect");

    // Check parent structure exists
    const footer = container.firstElementChild;
    expect(footer).toHaveClass("px-6", "py-4", "border-t", "mt-auto");
  });
});

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
      render(
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
      expect(
        screen.getByText("tokens:details.tokenInformation")
      ).toBeInTheDocument();
      expect(screen.getByText("My Token")).toBeInTheDocument();
      expect(screen.getByText("MTK")).toBeInTheDocument();
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
        screen.queryByText("tokens:details.tokenInformation")
      ).not.toBeInTheDocument();
    });

    it("shows asset details by default", () => {
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

      // showAssetDetails defaults to true
      expect(
        screen.getByText("tokens:details.tokenInformation")
      ).toBeInTheDocument();
      expect(screen.getByText("Test Token")).toBeInTheDocument();
      expect(screen.getByText("TEST")).toBeInTheDocument();
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
          title="Test Title"
          description="Test Description"
          submit={<button>Submit</button>}
          onCancel={mockOnCancel}
          children={undefined}
        />
      );

      // Should render without errors
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
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

      expect(screen.getByText("Token 1")).toBeInTheDocument();
      expect(screen.getByText("TEST")).toBeInTheDocument();

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

      expect(screen.getByText("Token 2")).toBeInTheDocument();
      expect(screen.getByText("TEST")).toBeInTheDocument();
    });
  });
});
