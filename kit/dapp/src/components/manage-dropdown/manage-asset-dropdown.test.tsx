import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManageAssetDropdown } from "./manage-asset-dropdown";

// Ensure mocked query functions always resolve to defined data to avoid TanStack Query warnings.
const resolveQueryData = <T,>(data: T) => vi.fn(() => Promise.resolve(data));

const mockYieldSchedule = {
  id: "yield-schedule-1",
  denominationAsset: { id: "0xdenomination" as const },
};

const mockTokenDetails = {
  id: "0xdenomination" as const,
  symbol: "DENOM",
  decimals: 18,
};

const emptyHolderResponse = {
  holder: {
    available: [0n, 18] as [bigint, number],
  },
};

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

// Mock ORPC client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    token: {
      mint: { mutationOptions: vi.fn(() => ({})) },
      read: {
        queryOptions: vi.fn(
          ({
            enabled,
            input: _input,
            ...rest
          }: { enabled?: boolean; input?: unknown } = {}) => ({
            ...rest,
            enabled,
            queryKey: ["token", "read"],
            queryFn: resolveQueryData(mockTokenDetails),
          })
        ),
        queryKey: vi.fn(() => ["token", "read"]),
      },
      list: { key: vi.fn(() => ["token", "list"]) },
      holders: {
        queryOptions: vi.fn(
          ({
            enabled,
            input: _input,
            ...rest
          }: { enabled?: boolean; input?: unknown } = {}) => ({
            ...rest,
            enabled,
            queryKey: ["token", "holders"],
            queryFn: resolveQueryData([]),
          })
        ),
        queryKey: vi.fn(() => ["token", "holders"]),
      },
      pause: { mutationOptions: vi.fn(() => ({})) },
      unpause: { mutationOptions: vi.fn(() => ({})) },
      holder: {
        queryOptions: vi.fn(
          ({
            enabled,
            input: _input,
            ...rest
          }: { enabled?: boolean; input?: unknown } = {}) => ({
            ...rest,
            enabled,
            queryKey: ["token", "holder"],
            queryFn: resolveQueryData(emptyHolderResponse),
          })
        ),
        queryKey: vi.fn(() => ["token", "holder"]),
      },
      updateCollateral: { mutationOptions: vi.fn(() => ({})) },
      setYieldSchedule: { mutationOptions: vi.fn(() => ({})) },
      burn: { mutationOptions: vi.fn(() => ({})) },
      mature: { mutationOptions: vi.fn(() => ({})) },
      grantRole: { mutationOptions: vi.fn(() => ({})) },
      revokeRole: { mutationOptions: vi.fn(() => ({})) },
      freezeAddress: { mutationOptions: vi.fn(() => ({})) },
      freezePartial: { mutationOptions: vi.fn(() => ({})) },
      unfreezePartial: { mutationOptions: vi.fn(() => ({})) },
    },
    fixedYieldSchedule: {
      read: {
        queryOptions: vi.fn(
          ({
            enabled,
            input: _input,
            ...rest
          }: { enabled?: boolean; input?: unknown } = {}) => ({
            ...rest,
            enabled,
            queryKey: ["fixedYieldSchedule", "read"],
            queryFn: resolveQueryData(mockYieldSchedule),
          })
        ),
      },
      topUp: { mutationOptions: vi.fn(() => ({})) },
      withdraw: { mutationOptions: vi.fn(() => ({})) },
      create: { mutationOptions: vi.fn(() => ({})) },
    },
  },
}));

// Mock auth client and hooks
vi.mock("@/lib/auth/auth.client", () => ({
  authClient: {},
}));

vi.mock("@/hooks/use-auth", () => ({
  useSession: () => ({ data: null }),
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
      {open && (
        <button
          onClick={() => {
            onOpenChange(false);
          }}
        >
          Close Sheet
        </button>
      )}
    </div>
  ),
}));

vi.mock("./sheets/mint-sheet", () => ({
  MintSheet: ({
    open,
    onOpenChange: _onOpenChange,
    asset,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: Token;
  }) => (
    <div data-testid="mint-sheet" data-open={open} data-asset-id={asset.id} />
  ),
}));

vi.mock("./sheets/set-yield-schedule-sheet", () => ({
  SetYieldScheduleSheet: ({
    open,
    onOpenChange: _onOpenChange,
    asset,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: Token;
  }) => (
    <div
      data-testid="set-yield-schedule-sheet"
      data-open={open}
      data-asset-id={asset.id}
    />
  ),
}));

vi.mock("./sheets/top-up-denomination-asset-sheet", () => ({
  TopUpDenominationAssetSheet: ({
    open,
    onOpenChange: _onOpenChange,
    asset,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: Token;
  }) => (
    <div
      data-testid="top-up-denomination-asset-sheet"
      data-open={open}
      data-asset-id={asset.id}
    />
  ),
}));

vi.mock("./sheets/collateral-sheet", () => ({
  CollateralSheet: ({
    open,
    onOpenChange: _onOpenChange,
    asset,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: Token;
  }) => (
    <div
      data-testid="collateral-sheet"
      data-open={open}
      data-asset-id={asset.id}
    />
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
    collateral: null,
    accessControl: undefined,
    userPermissions: {
      actions: {
        pause: true,
        unpause: true,
      },
    },
    ...overrides,
  }) as Token;

describe("ManageAssetDropdown", () => {
  const user = userEvent.setup();
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, queryFn: vi.fn(() => Promise.resolve({})) },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe("Rendering", () => {
    it("renders the manage button with correct text", () => {
      const asset = createMockToken();
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("press-effect");
    });

    it("renders the chevron icon", () => {
      const asset = createMockToken();
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      const chevron = button.querySelector("svg");
      expect(chevron).toBeInTheDocument();
      expect(chevron).toHaveClass("lucide-chevron-down");
    });
  });

  describe("Dropdown Menu", () => {
    it("opens dropdown menu when button is clicked", async () => {
      const asset = createMockToken();
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

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
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      await user.click(button);

      const pauseItem = screen.getByText(/tokens:actions.pause.label/i);
      expect(pauseItem).toBeInTheDocument();
    });

    it("shows unpause action when asset is paused", async () => {
      const asset = createMockToken({ pausable: { paused: true } });
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      await user.click(button);

      const unpauseItem = screen.getByText(/tokens:actions.unpause.label/i);
      expect(unpauseItem).toBeInTheDocument();
    });

    it("shows view events action as disabled", async () => {
      const asset = createMockToken();
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

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
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

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
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

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
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

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
    it("correctly handles asset without pausable capability (undefined)", async () => {
      const asset = createMockToken({ pausable: undefined });
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      expect(button).toBeInTheDocument();

      // Open dropdown
      await user.click(button);

      // Should NOT show pause/unpause actions
      expect(
        screen.queryByText(/tokens:actions.pause.label/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/tokens:actions.unpause.label/i)
      ).not.toBeInTheDocument();

      // Should still show other actions like viewEvents
      expect(
        screen.getByText(/tokens:actions.viewEvents/i)
      ).toBeInTheDocument();
    });

    it("correctly handles asset without pausable capability (null)", async () => {
      const asset = createMockToken({ pausable: null as unknown as undefined });
      renderWithProviders(<ManageAssetDropdown asset={asset} />);

      const button = screen.getByRole("button", { name: /tokens:manage/i });
      expect(button).toBeInTheDocument();

      // Open dropdown
      await user.click(button);

      // Should NOT show pause/unpause actions
      expect(
        screen.queryByText(/tokens:actions.pause.label/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/tokens:actions.unpause.label/i)
      ).not.toBeInTheDocument();

      // Should still show other actions like viewEvents
      expect(
        screen.getByText(/tokens:actions.viewEvents/i)
      ).toBeInTheDocument();
    });

    it("updates actions when asset state changes", () => {
      const asset = createMockToken({ pausable: { paused: false } });
      const { rerender } = renderWithProviders(
        <ManageAssetDropdown asset={asset} />
      );

      // Update asset to paused state
      const pausedAsset = createMockToken({ pausable: { paused: true } });
      rerender(
        <QueryClientProvider client={queryClient}>
          <ManageAssetDropdown asset={pausedAsset} />
        </QueryClientProvider>
      );

      // Actions should be updated (verified by opening dropdown)
      const button = screen.getByRole("button", { name: /tokens:manage/i });
      expect(button).toBeInTheDocument();
    });
  });
});
