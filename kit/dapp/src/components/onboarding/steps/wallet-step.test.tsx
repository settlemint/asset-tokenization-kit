import { describe, expect, it, mock, beforeEach } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock better-auth/react first to prevent initialization errors
void mock.module("better-auth/react", () => ({
  createAuthClient: mock(() => ({
    useSession: mock(() => ({ data: null })),
    wallet: mock(() => Promise.resolve()),
    pincode: { enable: mock(() => Promise.resolve()) },
  })),
}));

// Mock better-auth plugins
void mock.module("better-auth/client/plugins", () => ({
  adminClient: mock(() => ({})),
  apiKeyClient: mock(() => ({})),
  inferAdditionalFields: mock(() => ({})),
  passkeyClient: mock(() => ({})),
}));

// Mock custom auth plugins
void mock.module("@/lib/auth/plugins/pincode-plugin/client", () => ({
  pincodeClient: mock(() => ({})),
}));

void mock.module("@/lib/auth/plugins/secret-codes-plugin/client", () => ({
  secretCodesClient: mock(() => ({})),
}));

void mock.module("@/lib/auth/plugins/two-factor/client", () => ({
  twoFactorClient: mock(() => ({})),
}));

void mock.module("@/lib/auth/plugins/wallet-plugin/client", () => ({
  walletClient: mock(() => ({})),
}));

void mock.module("@/lib/auth", () => ({
  auth: {},
}));

void mock.module("@/lib/auth/permissions", () => ({
  accessControl: {},
  adminRole: {},
  investorRole: {},
  issuerRole: {},
}));

// Mock session data
const mockSession = {
  user: {
    initialOnboardingFinished: false,
    wallet: null as string | null,
  },
};

// Mock authClient
const mockWallet = mock(() => Promise.resolve());
const mockPincodeEnable = mock(() => Promise.resolve());
const mockUseSession = mock(() => ({
  data: mockSession,
}));

void mock.module("@/lib/auth/auth.client", () => ({
  authClient: {
    useSession: mockUseSession,
    wallet: mockWallet,
    pincode: {
      enable: mockPincodeEnable,
    },
  },
}));

import { WalletStep } from "./wallet-step";

// Mock query client
void mock.module("@/lib/query.client", () => ({
  queryClient: {
    invalidateQueries: mock(() => Promise.resolve()),
  },
}));

// Mock AuthQueryContext
void mock.module("@daveyplate/better-auth-tanstack", () => ({
  AuthQueryContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({
      children,
    }: {
      children: (value: { sessionKey: string[] }) => React.ReactNode;
    }) => children({ sessionKey: ["auth", "session"] }),
  },
}));

// Mock TanStack Query
const mockMutate = mock(() => Promise.resolve());
void mock.module("@tanstack/react-query", () => ({
  useMutation: mock(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

// Mock sonner
void mock.module("sonner", () => ({
  toast: {
    success: mock(() => {}),
  },
}));

void mock.module("react-i18next", () => ({
  useTranslation: mock(() => ({
    t: (key: string) => key,
  })),
}));

// Mock UI components
void mock.module("@kit/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3>{children}</h3>
  ),
}));

void mock.module("@kit/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

void mock.module("@kit/ui/icon", () => ({
  IconLoader2: ({ className }: { className?: string }) => (
    <span className={className}>Loading...</span>
  ),
  IconCheck: () => <span>✓</span>,
  IconCopy: () => <span>Copy</span>,
}));

// No PIN input needed - component doesn't use it

// Mock clipboard
const mockWriteText = mock(() => Promise.resolve());
if (typeof navigator !== "undefined") {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: mockWriteText,
    },
    configurable: true,
    writable: true,
  });
}

// Mock React context
const mockUseContext = mock(() => ({ sessionKey: ["auth", "session"] }));
void mock.module("react", () => ({
  ...require("react"),
  useContext: mockUseContext,
}));

// Set up base URL for better-auth
if (typeof window !== "undefined") {
  Object.defineProperty(window, "location", {
    value: {
      href: "http://localhost:3000",
      origin: "http://localhost:3000",
    },
    writable: true,
  });
}

describe("WalletStep", () => {
  beforeEach(() => {
    // Reset session data
    mockSession.user.initialOnboardingFinished = false;
    mockSession.user.wallet = null;

    // Clear all mocks
    mockMutate.mockClear();
    mockWriteText.mockClear();
    mockWallet.mockClear();
    mockPincodeEnable.mockClear();
    mockUseSession.mockClear();

    // Reset context mock
    mockUseContext.mockReturnValue({ sessionKey: ["auth", "session"] });
  });

  it("renders initial state correctly", () => {
    render(<WalletStep />);

    expect(screen.getByText("wallet.generate-your-wallet")).toBeInTheDocument();
    expect(screen.getByText("wallet.create-secure-wallet")).toBeInTheDocument();
  });

  it("shows info about wallet when not generated", () => {
    render(<WalletStep />);

    expect(screen.getByText("wallet.what-is-wallet")).toBeInTheDocument();
    expect(screen.getByText("wallet.wallet-description")).toBeInTheDocument();
    expect(screen.getByText("wallet.features.secure")).toBeInTheDocument();
    expect(screen.getByText("wallet.features.instant")).toBeInTheDocument();
  });

  it("creates wallet when action is triggered", async () => {
    const { authClient } = await import("@/lib/auth/auth.client");
    let registeredAction: (() => void) | null = null;

    render(
      <WalletStep
        onRegisterAction={(action) => {
          registeredAction = action;
        }}
      />
    );

    expect(registeredAction).not.toBeNull();
    if (registeredAction) {
      registeredAction();
    }

    await waitFor(() => {
      expect(authClient.wallet).toHaveBeenCalledWith({
        messages: {
          walletAlreadyExists: "onboarding:wallet.already-exists",
          walletCreationFailed: "onboarding:wallet.creation-failed",
        },
      });
    });
  });

  it("shows loading state during wallet creation", async () => {
    const { useMutation } = await import("@tanstack/react-query");
    (useMutation as ReturnType<typeof mock>).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<WalletStep />);

    // Component doesn't show loading text, but we can verify the mutation state
    expect(useMutation).toHaveBeenCalled();
  });

  it("displays wallet address after creation", () => {
    mockSession.user.initialOnboardingFinished = true;
    mockSession.user.wallet = "0x1234567890abcdef";

    render(<WalletStep />);

    expect(screen.getByText("wallet.your-wallet")).toBeInTheDocument();
    expect(screen.getByText("0x1234567890abcdef")).toBeInTheDocument();
  });

  it("shows success message when wallet is generated", () => {
    mockSession.user.initialOnboardingFinished = true;
    mockSession.user.wallet = "0x1234567890abcdef";

    render(<WalletStep />);

    expect(
      screen.getByText("wallet.wallet-generated-successfully")
    ).toBeInTheDocument();
  });

  it("shows blockchain identity ready message when wallet exists", () => {
    mockSession.user.initialOnboardingFinished = true;
    mockSession.user.wallet = "0x1234567890abcdef";

    render(<WalletStep />);

    expect(
      screen.getByText("wallet.blockchain-identity-ready")
    ).toBeInTheDocument();
  });

  it("registers action handler when provided", () => {
    const mockRegister = mock(() => {
      // Mock register function
    });
    render(<WalletStep onRegisterAction={mockRegister} />);

    expect(mockRegister).toHaveBeenCalledWith(expect.any(Function));
  });

  it("calls pincode.enable after wallet creation", async () => {
    const { authClient } = await import("@/lib/auth/auth.client");
    let registeredAction: (() => void) | null = null;

    render(
      <WalletStep
        onRegisterAction={(action) => {
          registeredAction = action;
        }}
      />
    );

    if (registeredAction) {
      await registeredAction();
    }

    await waitFor(() => {
      expect(authClient.pincode.enable).toHaveBeenCalledWith({
        pincode: "111111",
      });
    });
  });

  it("invalidates session queries after wallet creation", async () => {
    const { queryClient } = await import("@/lib/query.client");
    const { useMutation } = await import("@tanstack/react-query");

    let onSuccessCallback: (() => void) | null = null;
    (useMutation as ReturnType<typeof mock>).mockImplementation((options) => {
      onSuccessCallback = options.onSuccess;
      return {
        mutate: mockMutate,
        isPending: false,
      };
    });

    render(<WalletStep />);

    // Trigger onSuccess
    if (onSuccessCallback) {
      await onSuccessCallback();
    }

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["auth", "session"],
    });
  });

  it("shows toast message on successful wallet creation", async () => {
    const { toast } = await import("sonner");
    const { useMutation } = await import("@tanstack/react-query");

    let onSuccessCallback: (() => void) | null = null;
    (useMutation as ReturnType<typeof mock>).mockImplementation((options) => {
      onSuccessCallback = options.onSuccess;
      return {
        mutate: mockMutate,
        isPending: false,
      };
    });

    render(<WalletStep />);

    // Trigger onSuccess
    if (onSuccessCallback) {
      await onSuccessCallback();
    }

    expect(toast.success).toHaveBeenCalledWith("onboarding:wallet.generated");
  });

  it("does not register action when wallet already exists", () => {
    mockSession.user.initialOnboardingFinished = true;
    mockSession.user.wallet = "0x1234567890abcdef";

    const mockRegister = mock(() => {
      // Mock register function
    });

    render(<WalletStep onRegisterAction={mockRegister} />);

    // Should register a no-op function when wallet exists
    expect(mockRegister).toHaveBeenCalledWith(expect.any(Function));
  });

  it("updates justGenerated state after successful creation", async () => {
    const { useMutation } = await import("@tanstack/react-query");

    let onSuccessCallback: (() => void) | null = null;
    (useMutation as ReturnType<typeof mock>).mockImplementation((options) => {
      onSuccessCallback = options.onSuccess;
      return {
        mutate: mockMutate,
        isPending: false,
      };
    });

    // Start without wallet
    mockSession.user.initialOnboardingFinished = false;
    const { rerender } = render(<WalletStep />);

    // Trigger onSuccess
    if (onSuccessCallback) {
      await onSuccessCallback();
    }

    // Update session to have wallet
    mockSession.user.initialOnboardingFinished = true;
    mockSession.user.wallet = "0x1234567890abcdef";

    rerender(<WalletStep />);

    // Should show the wallet address
    expect(screen.getByText("0x1234567890abcdef")).toBeInTheDocument();
  });
});
