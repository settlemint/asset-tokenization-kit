import { useAppForm } from "@/hooks/use-app-form";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { from } from "dnum";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MintSheet } from "./mint-sheet";

// i18n mock
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

// toast mock
vi.mock("sonner", () => ({
  toast: { promise: vi.fn((p) => p) },
}));

// orpc mock
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    token: {
      mint: { mutationOptions: vi.fn(() => ({})) },
      read: { queryOptions: vi.fn(() => ({ queryKey: ["token", "read"] })) },
    },
  },
}));

// ActionFormSheet mock with Continue/Submit controls
vi.mock("../core/action-form-sheet", () => ({
  ActionFormSheet: ({
    children,
    title,
    onSubmit,
    canContinue,
  }: {
    children?: React.ReactNode;
    title: string;
    onSubmit: (data: { secretVerificationCode: string }) => void;
    canContinue?: () => boolean;
  }) => (
    <div data-testid="action-form-sheet">
      <div data-testid="sheet-title">{title}</div>
      <div>{children}</div>
      <button
        data-testid="continue-button"
        disabled={canContinue ? !canContinue() : false}
      >
        Continue
      </button>
      <button
        data-testid="submit-button"
        onClick={() => {
          onSubmit({ secretVerificationCode: "123456" });
        }}
      >
        Submit
      </button>
    </div>
  ),
}));

// useAppForm mock: expose field renderers
vi.mock("@/hooks/use-app-form", () => ({
  useAppForm: vi.fn(() => ({
    Subscribe: ({ children }: { children: () => React.ReactNode }) => (
      <>{children()}</>
    ),
    AppField: ({
      children,
    }: {
      children: (c: {
        AddressSelectField: (
          props: React.InputHTMLAttributes<HTMLInputElement>
        ) => React.ReactElement;
        AddressInputField: (
          props: React.InputHTMLAttributes<HTMLInputElement>
        ) => React.ReactElement;
        DnumField: (
          props: React.InputHTMLAttributes<HTMLInputElement>
        ) => React.ReactElement;
      }) => React.ReactNode;
    }) => (
      <div>
        {children({
          AddressSelectField: (props) => (
            <input data-testid="address-select" {...props} />
          ),
          AddressInputField: (props) => (
            <input data-testid="address-input" {...props} />
          ),
          DnumField: (props) => <input data-testid="dnum-input" {...props} />,
        })}
      </div>
    ),
    reset: vi.fn(),
    getFieldValue: vi.fn(() => undefined),
  })),
}));

const createMockToken = (overrides?: Partial<Token>): Token =>
  ({
    id: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    name: "Test Token",
    symbol: "TEST",
    decimals: 18,
    totalSupply: [0n, 18] as [bigint, number],
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
      roles: { admin: true } as Record<string, boolean>,
      isAllowed: true,
      actions: { mint: true } as Record<string, boolean>,
    },
    ...overrides,
  }) as Token;

describe("MintSheet", () => {
  const user = userEvent.setup();
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // default form mock
    vi.mocked(useAppForm).mockReturnValue({
      Subscribe: ({ children }: { children: () => React.ReactNode }) => (
        <>{children()}</>
      ),
      AppField: ({
        children,
      }: {
        children: (c: {
          AddressSelectField: (
            props: React.InputHTMLAttributes<HTMLInputElement>
          ) => React.ReactElement;
          AddressInputField: (
            props: React.InputHTMLAttributes<HTMLInputElement>
          ) => React.ReactElement;
          DnumField: (
            props: React.InputHTMLAttributes<HTMLInputElement>
          ) => React.ReactElement;
        }) => React.ReactNode;
      }) => (
        <div>
          {children({
            AddressSelectField: (props) => (
              <input data-testid="address-select" {...props} />
            ),
            AddressInputField: (props) => (
              <input data-testid="address-input" {...props} />
            ),
            DnumField: (props) => <input data-testid="dnum-input" {...props} />,
          })}
        </div>
      ),
      reset: vi.fn(),
      getFieldValue: vi.fn(() => undefined),
    } as unknown as ReturnType<typeof useAppForm>);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) =>
    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );

  it("shows Continue disabled initially", () => {
    renderWithProviders(
      <MintSheet open asset={createMockToken()} onOpenChange={() => {}} />
    );
    const continueBtn = screen.getByTestId("continue-button");
    expect(continueBtn).toBeDisabled();
  });

  it("enforces cap/collateral limits by disabling Continue when exceeded", async () => {
    const token = createMockToken({
      capped: { cap: [100n, 18] as [bigint, number] },
      collateral: {
        collateral: [50n, 18] as [bigint, number],
        expiryTimestamp: null,
      },
    });
    renderWithProviders(
      <MintSheet open asset={token} onOpenChange={() => {}} />
    );
    const continueBtn = screen.getByTestId("continue-button");

    const addr = screen.getByTestId("address-select");
    await user.type(addr, "0x1111111111111111111111111111111111111111");
    const amt = screen.getByTestId("dnum-input");
    await user.type(amt, "60"); // exceeds collateral 50

    expect(continueBtn).toBeDisabled();
  });

  it("submits mint mutation with batch arrays", async () => {
    const mockMint = vi.fn().mockResolvedValue({});
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.mint.mutationOptions).mockReturnValue({
      mutationFn: mockMint,
    } as ReturnType<typeof orpc.token.mint.mutationOptions>);

    // override getFieldValue to return values
    vi.mocked(useAppForm).mockReturnValue({
      Subscribe: ({ children }: { children: () => React.ReactNode }) => (
        <>{children()}</>
      ),
      AppField: ({
        children,
      }: {
        children: (c: {
          AddressSelectField: (
            props: React.InputHTMLAttributes<HTMLInputElement>
          ) => React.ReactElement;
          AddressInputField: (
            props: React.InputHTMLAttributes<HTMLInputElement>
          ) => React.ReactElement;
          DnumField: (
            props: React.InputHTMLAttributes<HTMLInputElement>
          ) => React.ReactElement;
        }) => React.ReactNode;
      }) => (
        <div>
          {children({
            AddressSelectField: (props) => (
              <input data-testid="address-select" {...props} />
            ),
            AddressInputField: (props) => (
              <input data-testid="address-input" {...props} />
            ),
            DnumField: (props) => <input data-testid="dnum-input" {...props} />,
          })}
        </div>
      ),
      reset: vi.fn(),
      getFieldValue: vi.fn((name: string) =>
        name.startsWith("recipient_")
          ? "0x1111111111111111111111111111111111111111"
          : from(10n, 18)
      ),
    } as unknown as ReturnType<typeof useAppForm>);

    renderWithProviders(
      <MintSheet open asset={createMockToken()} onOpenChange={() => {}} />
    );
    const addr = screen.getByTestId("address-select");
    await user.type(addr, "0x1111111111111111111111111111111111111111");
    const amt = screen.getByTestId("dnum-input");
    await user.type(amt, "10");

    await user.click(screen.getByTestId("submit-button"));
    expect(mockMint).toHaveBeenCalled();
  });
});
