import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PauseUnpauseConfirmationSheet } from "./pause-unpause-confirmation-sheet";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (
      key: string,
      options?: { defaultValue?: string; name?: string; symbol?: string }
    ) => {
      if (options?.defaultValue) return options.defaultValue;

      // Handle interpolation for pause/unpause success messages (with or without namespace)
      if (
        (key === "tokens:actions.pause.messages.success" ||
          key === "actions.pause.messages.success") &&
        options?.name &&
        options?.symbol
      ) {
        return `Asset '${options.name} (${options.symbol})' paused successfully`;
      }
      if (
        (key === "tokens:actions.unpause.messages.success" ||
          key === "actions.unpause.messages.success") &&
        options?.name &&
        options?.symbol
      ) {
        return `Asset '${options.name} (${options.symbol})' unpaused successfully`;
      }

      // Return proper translations for known keys (both with and without namespace)
      const translations: Record<string, string> = {
        // With namespace
        "tokens:actions.pause.title": "Pause Token Transfers",
        "tokens:actions.pause.description":
          "Pausing this token will prevent all transfers until it is unpaused. This action requires verification.",
        "tokens:actions.pause.submit": "Pause Token",
        "tokens:actions.pause.messages.loading": "Pausing token...",
        "tokens:actions.pause.messages.error": "Failed to pause token",
        "tokens:actions.pause.messages.submitting": "Pausing token...",
        "tokens:actions.unpause.title": "Unpause Token Transfers",
        "tokens:actions.unpause.description":
          "Unpausing this token will allow transfers to resume. This action requires verification.",
        "tokens:actions.unpause.submit": "Unpause Token",
        "tokens:actions.unpause.messages.loading": "Unpausing token...",
        "tokens:actions.unpause.messages.error": "Failed to unpause token",
        "tokens:actions.unpause.messages.submitting": "Unpausing token...",
        "tokens:details.stateChange": "State Change",
        "tokens:details.currentState": "Current State",
        "tokens:details.targetState": "Target State",
        "tokens:status.paused": "Paused",
        "tokens:status.active": "Active",
        // Without namespace (for toast messages)
        "actions.pause.messages.error": "Failed to pause token",
        "actions.pause.messages.submitting": "Pausing token...",
        "actions.unpause.messages.error": "Failed to unpause token",
        "actions.unpause.messages.submitting": "Unpausing token...",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    promise: vi.fn((promise) => ({ unwrap: () => promise })),
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
      secretVerificationCode: string;
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
          onSubmit({
            secretVerificationCode: "123456",
            verificationType: "PINCODE",
          });
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
        "Pause Token Transfers"
      );
      expect(screen.getByTestId("sheet-description")).toHaveTextContent(
        "Pausing this token will prevent all transfers until it is unpaused. This action requires verification."
      );
      expect(screen.getByTestId("sheet-submit-label")).toHaveTextContent(
        "Pause Token"
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
      expect(confirmContent).toHaveTextContent("State Change");
      expect(confirmContent).toHaveTextContent("Current State");
      expect(confirmContent).toHaveTextContent("Active");
      expect(confirmContent).toHaveTextContent("Target State");
      expect(confirmContent).toHaveTextContent("Paused");
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
        "Unpause Token Transfers"
      );
      expect(screen.getByTestId("sheet-description")).toHaveTextContent(
        "Unpausing this token will allow transfers to resume. This action requires verification."
      );
      expect(screen.getByTestId("sheet-submit-label")).toHaveTextContent(
        "Unpause Token"
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
      expect(confirmContent).toHaveTextContent("Current State");
      expect(confirmContent).toHaveTextContent("Paused");
      expect(confirmContent).toHaveTextContent("Target State");
      expect(confirmContent).toHaveTextContent("Active");
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
            error: expect.any(Function),
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
            error: expect.any(Function),
            loading: expect.any(String),
          })
        );
      });
    });
  });
});
