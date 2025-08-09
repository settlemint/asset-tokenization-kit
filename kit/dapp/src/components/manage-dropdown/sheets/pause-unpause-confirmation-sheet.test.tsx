import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PauseUnpauseConfirmationSheet } from "./pause-unpause-confirmation-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { orpc } from "@/orpc/orpc-client";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => {
      if (options?.defaultValue) return options.defaultValue;
      return key;
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise) => promise),
  },
}));

vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    token: {
      pause: {
        mutationOptions: vi.fn(() => ({})),
        key: vi.fn(() => ["token", "pause"]),
      },
      unpause: {
        mutationOptions: vi.fn(() => ({})),
        key: vi.fn(() => ["token", "unpause"]),
      },
      read: {
        key: vi.fn(() => ["token", "read"]),
      },
      list: {
        key: vi.fn(() => ["token", "list"]),
      },
    },
  },
}));

vi.mock("../core/action-form-sheet", () => ({
  ActionFormSheet: ({
    open,
    onOpenChange,
    title,
    description,
    submitLabel,
    onSubmit,
    confirm,
    hasValuesStep,
    isSubmitting,
    showAssetDetailsOnConfirm,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    submitLabel: string;
    onSubmit: (data: {
      verificationCode: string;
      verificationType: string;
    }) => void;
    confirm?: React.ReactNode;
    hasValuesStep?: boolean;
    isSubmitting?: boolean;
    showAssetDetailsOnConfirm?: boolean;
  }) => (
    <div data-testid="action-form-sheet" data-open={open}>
      <div data-testid="sheet-title">{title}</div>
      <div data-testid="sheet-description">{description}</div>
      <div data-testid="sheet-submit-label">{submitLabel}</div>
      <div data-testid="sheet-confirm">{confirm}</div>
      <div data-testid="sheet-has-values-step">{String(hasValuesStep)}</div>
      <div data-testid="sheet-is-submitting">{String(isSubmitting)}</div>
      <div data-testid="sheet-show-asset-details">
        {String(showAssetDetailsOnConfirm)}
      </div>
      <button
        data-testid="submit-button"
        onClick={() => {
          onSubmit({ verificationCode: "123456", verificationType: "pincode" });
        }}
      >
        Submit
      </button>
      <button
        data-testid="close-button"
        onClick={() => {
          onOpenChange(false);
        }}
      >
        Close
      </button>
    </div>
  ),
}));

const createMockToken = (overrides?: Partial<Token>): Token =>
  ({
    id: "0x1234567890123456789012345678901234567890",
    name: "Test Token",
    symbol: "TEST",
    decimals: 18,
    totalSupply: [1_000_000n, 18],
    type: "bond",
    createdAt: 1_234_567_890,
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

describe("PauseUnpauseConfirmationSheet", () => {
  const user = userEvent.setup();
  let queryClient: QueryClient;
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
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

  describe("Rendering - Pause State", () => {
    it("renders pause sheet with correct props when asset is not paused", () => {
      const asset = createMockToken({ pausable: { paused: false } });

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      expect(screen.getByTestId("sheet-title")).toHaveTextContent(
        "tokens:actions.pause.title"
      );
      expect(screen.getByTestId("sheet-description")).toHaveTextContent(
        "tokens:actions.pause.description"
      );
      expect(screen.getByTestId("sheet-submit-label")).toHaveTextContent(
        "tokens:actions.pause.submit"
      );
      expect(screen.getByTestId("sheet-has-values-step")).toHaveTextContent(
        "false"
      );
      expect(screen.getByTestId("sheet-show-asset-details")).toHaveTextContent(
        "false"
      );
    });

    it("renders state change card for pause action", () => {
      const asset = createMockToken({ pausable: { paused: false } });

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      const confirmContent = screen.getByTestId("sheet-confirm");
      expect(confirmContent).toHaveTextContent("tokens:details.stateChange");
      expect(confirmContent).toHaveTextContent("tokens:details.currentState");
      expect(confirmContent).toHaveTextContent("tokens:status.active");
      expect(confirmContent).toHaveTextContent("tokens:details.targetState");
      expect(confirmContent).toHaveTextContent("tokens:status.paused");
    });
  });

  describe("Rendering - Unpause State", () => {
    it("renders unpause sheet with correct props when asset is paused", () => {
      const asset = createMockToken({ pausable: { paused: true } });

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      expect(screen.getByTestId("sheet-title")).toHaveTextContent(
        "tokens:actions.unpause.title"
      );
      expect(screen.getByTestId("sheet-description")).toHaveTextContent(
        "tokens:actions.unpause.description"
      );
      expect(screen.getByTestId("sheet-submit-label")).toHaveTextContent(
        "tokens:actions.unpause.submit"
      );
    });

    it("renders state change card for unpause action", () => {
      const asset = createMockToken({ pausable: { paused: true } });

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      const confirmContent = screen.getByTestId("sheet-confirm");
      expect(confirmContent).toHaveTextContent("tokens:details.currentState");
      expect(confirmContent).toHaveTextContent("tokens:status.paused");
      expect(confirmContent).toHaveTextContent("tokens:details.targetState");
      expect(confirmContent).toHaveTextContent("tokens:status.active");
    });
  });

  describe("Sheet Visibility", () => {
    it("renders when open is true", () => {
      const asset = createMockToken();

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      expect(screen.getByTestId("action-form-sheet")).toHaveAttribute(
        "data-open",
        "true"
      );
    });

    it("does not render when open is false", () => {
      const asset = createMockToken();

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={false}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      expect(screen.getByTestId("action-form-sheet")).toHaveAttribute(
        "data-open",
        "false"
      );
    });
  });

  describe("User Interactions", () => {
    it("calls onOpenChange(false) when close button is clicked", async () => {
      const asset = createMockToken();

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      const closeButton = screen.getByTestId("close-button");
      await user.click(closeButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("handles pause submission with verification", async () => {
      const asset = createMockToken({ pausable: { paused: false } });
      const mockPauseMutation = vi.fn().mockResolvedValue({});

      vi.mocked(orpc.token.pause.mutationOptions).mockReturnValue({
        mutationFn: mockPauseMutation,
      } as ReturnType<typeof orpc.token.pause.mutationOptions>);

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      // Wait for async operations
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("handles unpause submission with verification", async () => {
      const asset = createMockToken({ pausable: { paused: true } });
      const mockUnpauseMutation = vi.fn().mockResolvedValue({});

      vi.mocked(orpc.token.unpause.mutationOptions).mockReturnValue({
        mutationFn: mockUnpauseMutation,
      } as ReturnType<typeof orpc.token.unpause.mutationOptions>);

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      // Wait for async operations
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Loading States", () => {
    it("shows loading state during pause mutation", async () => {
      const asset = createMockToken({ pausable: { paused: false } });

      // Mock a slow mutation
      const mockPauseMutation = vi.fn(() => new Promise(() => {})); // Never resolves

      vi.mocked(orpc.token.pause.mutationOptions).mockReturnValue({
        mutationFn: mockPauseMutation,
      } as ReturnType<typeof orpc.token.pause.mutationOptions>);

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      // Initially not submitting
      expect(screen.getByTestId("sheet-is-submitting")).toHaveTextContent(
        "false"
      );

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      // Should show submitting state
      await waitFor(() => {
        expect(screen.getByTestId("sheet-is-submitting")).toHaveTextContent(
          "true"
        );
      });
    });
  });

  describe("Toast Notifications", () => {
    it("shows toast promise for pause action", async () => {
      const asset = createMockToken({
        pausable: { paused: false },
        name: "My Token",
        symbol: "MTK",
      });

      const { toast } = await import("sonner");
      const mockPauseMutation = vi.fn().mockResolvedValue({});

      vi.mocked(orpc.token.pause.mutationOptions).mockReturnValue({
        mutationFn: mockPauseMutation,
      } as ReturnType<typeof orpc.token.pause.mutationOptions>);

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.promise).toHaveBeenCalledWith(
          expect.any(Promise),
          expect.objectContaining({
            success: expect.stringContaining("My Token"),
            error: expect.any(String),
            loading: expect.any(String),
          })
        );
      });
    });

    it("shows toast promise for unpause action", async () => {
      const asset = createMockToken({
        pausable: { paused: true },
        name: "My Token",
        symbol: "MTK",
      });

      const { toast } = await import("sonner");
      const mockUnpauseMutation = vi.fn().mockResolvedValue({});

      vi.mocked(orpc.token.unpause.mutationOptions).mockReturnValue({
        mutationFn: mockUnpauseMutation,
      } as ReturnType<typeof orpc.token.unpause.mutationOptions>);

      renderWithProviders(
        <PauseUnpauseConfirmationSheet
          open={true}
          onOpenChange={mockOnOpenChange}
          asset={asset}
        />
      );

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.promise).toHaveBeenCalledWith(
          expect.any(Promise),
          expect.objectContaining({
            success: expect.stringContaining("My Token"),
            error: expect.any(String),
            loading: expect.any(String),
          })
        );
      });
    });
  });
});
