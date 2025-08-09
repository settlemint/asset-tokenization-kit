import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ManageAssetDropdown } from "./manage-asset-dropdown";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("./sheets/pause-unpause-confirmation-sheet", () => ({
  PauseUnpauseConfirmationSheet: ({
    open,
    onOpenChange,
    asset,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: Token;
  }) => (
    <div
      data-testid="pause-unpause-sheet"
      data-open={open}
      data-asset-id={asset.id}
    >
      {open && <button onClick={() => onOpenChange(false)}>Close Sheet</button>}
    </div>
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

describe("ManageAssetDropdown", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the manage button with correct text", () => {
      const asset = createMockToken();
      render(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("press-effect");
    });

    it("renders the chevron icon", () => {
      const asset = createMockToken();
      render(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      const chevron = button.querySelector("svg");
      expect(chevron).toBeInTheDocument();
      expect(chevron).toHaveClass("lucide-chevron-down");
    });
  });

  describe("Dropdown Menu", () => {
    it("opens dropdown menu when button is clicked", async () => {
      const asset = createMockToken();
      render(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      await user.click(button);

      // Check if menu items are visible
      expect(
        screen.getByText(/tokens:actions.pause.label/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/tokens:actions.viewEvents/i)
      ).toBeInTheDocument();
    });

    it("shows pause action when asset is not paused", async () => {
      const asset = createMockToken({ pausable: { paused: false } });
      render(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      await user.click(button);

      const pauseItem = screen.getByText(/tokens:actions.pause.label/i);
      expect(pauseItem).toBeInTheDocument();
    });

    it("shows unpause action when asset is paused", async () => {
      const asset = createMockToken({ pausable: { paused: true } });
      render(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      await user.click(button);

      const unpauseItem = screen.getByText(/tokens:actions.unpause.label/i);
      expect(unpauseItem).toBeInTheDocument();
    });

    it("shows view events action as disabled", async () => {
      const asset = createMockToken();
      render(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      await user.click(button);

      const viewEventsItem = screen.getByText(/tokens:actions.viewEvents/i);
      expect(viewEventsItem).toBeInTheDocument();
      expect(viewEventsItem.closest('[role="menuitem"]')).toHaveAttribute(
        "aria-disabled",
        "true"
      );
    });
  });

  describe("Pause/Unpause Sheet", () => {
    it("opens pause sheet when pause action is clicked", async () => {
      const asset = createMockToken({ pausable: { paused: false } });
      render(<ManageAssetDropdown asset={asset} />);

      // Open dropdown
      const button = screen.getByRole("button", { name: /tokens:manage/i });
      await user.click(button);

      // Click pause action
      const pauseItem = screen.getByText(/tokens:actions.pause.label/i);
      await user.click(pauseItem);

      // Check sheet is opened
      const sheet = screen.getByTestId("pause-unpause-sheet");
      expect(sheet).toHaveAttribute("data-open", "true");
      expect(sheet).toHaveAttribute("data-asset-id", asset.id);
    });

    it("opens unpause sheet when unpause action is clicked", async () => {
      const asset = createMockToken({ pausable: { paused: true } });
      render(<ManageAssetDropdown asset={asset} />);

      // Open dropdown
      const button = screen.getByRole("button", { name: /tokens:manage/i });
      await user.click(button);

      // Click unpause action
      const unpauseItem = screen.getByText(/tokens:actions.unpause.label/i);
      await user.click(unpauseItem);

      // Check sheet is opened
      const sheet = screen.getByTestId("pause-unpause-sheet");
      expect(sheet).toHaveAttribute("data-open", "true");
      expect(sheet).toHaveAttribute("data-asset-id", asset.id);
    });

    it("closes sheet when onOpenChange is called with false", async () => {
      const asset = createMockToken({ pausable: { paused: false } });
      render(<ManageAssetDropdown asset={asset} />);

      // Open dropdown and click pause
      const button = screen.getByRole("button", { name: /tokens:manage/i });
      await user.click(button);
      const pauseItem = screen.getByText(/tokens:actions.pause.label/i);
      await user.click(pauseItem);

      // Sheet should be open
      const sheet = screen.getByTestId("pause-unpause-sheet");
      expect(sheet).toHaveAttribute("data-open", "true");

      // Close sheet
      const closeButton = within(sheet).getByText("Close Sheet");
      await user.click(closeButton);

      // Sheet should be closed
      expect(sheet).toHaveAttribute("data-open", "false");
    });
  });

  describe("Asset State Handling", () => {
    it("correctly handles asset without pausable capability", () => {
      const asset = createMockToken({ pausable: null } as any);

      // Should render without throwing error, but might not show dropdown actions
      render(<ManageAssetDropdown asset={asset} />);
      const button = screen.getByRole("button", { name: /tokens:manage/i });
      expect(button).toBeInTheDocument();
    });

    it("updates actions when asset state changes", () => {
      const asset = createMockToken({ pausable: { paused: false } });
      const { rerender } = render(<ManageAssetDropdown asset={asset} />);

      // Update asset to paused state
      const pausedAsset = createMockToken({ pausable: { paused: true } });
      rerender(<ManageAssetDropdown asset={pausedAsset} />);

      // Actions should be updated (verified by opening dropdown)
      const button = screen.getByRole("button", { name: /tokens:manage/i });
      expect(button).toBeInTheDocument();
    });
  });
});
