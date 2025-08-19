import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BurnSheet } from "./burn-sheet";
import { useAppForm } from "@/hooks/use-app-form";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";

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

// Mock useQuery to provide controlled data
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

// orpc mock
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    token: {
      burn: { mutationOptions: vi.fn(() => ({})) },
      read: { queryOptions: vi.fn(() => ({ queryKey: ["token", "read"] })) },
      holders: {
        queryOptions: vi.fn(() => ({
          queryKey: ["token", "holders"],
        })),
      },
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
        BigIntField: (
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
          BigIntField: (props) => (
            <input data-testid="bigint-input" {...props} />
          ),
        })}
      </div>
    ),
    reset: vi.fn(),
    getFieldValue: vi.fn(() => undefined),
    setFieldValue: vi.fn(),
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
      actions: { burn: true } as Record<string, boolean>,
    },
    ...overrides,
  }) as Token;

describe("BurnSheet", () => {
  const user = userEvent.setup();
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useQuery - returns holder with balance
    vi.mocked(useQuery).mockReturnValue({
      data: {
        token: {
          balances: [
            {
              account: {
                id: "0x1111111111111111111111111111111111111111",
              },
              available: [100n, 18],
              frozen: [0n, 18],
              isFrozen: false,
              value: [100n, 18],
            },
          ],
        },
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useQuery>);
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
          BigIntField: (
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
            BigIntField: (props) => (
              <input data-testid="bigint-input" {...props} />
            ),
          })}
        </div>
      ),
      reset: vi.fn(),
      getFieldValue: vi.fn(() => undefined),
      setFieldValue: vi.fn(),
    } as unknown as ReturnType<typeof useAppForm>);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) =>
    render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );

  it("disables Continue when amount exceeds available balance", () => {
    // Mock holder with less balance than being burned
    vi.mocked(useQuery).mockReturnValue({
      data: {
        token: {
          balances: [
            {
              account: {
                id: "0x1111111111111111111111111111111111111111",
              },
              available: [5n, 18], // Less than the 10n being burned
              frozen: [0n, 18],
              isFrozen: false,
              value: [5n, 18],
            },
          ],
        },
      },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useQuery>);

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
          BigIntField: (
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
            BigIntField: (props) => (
              <input data-testid="bigint-input" {...props} />
            ),
          })}
        </div>
      ),
      reset: vi.fn(),
      getFieldValue: vi.fn((name: string) =>
        name.startsWith("burn_address_")
          ? "0x1111111111111111111111111111111111111111"
          : 10n
      ),
      setFieldValue: vi.fn(),
    } as unknown as ReturnType<typeof useAppForm>);

    renderWithProviders(
      <BurnSheet
        open
        asset={createMockToken()}
        onOpenChange={() => {}}
        preset={{
          address: "0x1111111111111111111111111111111111111111",
          available: [0n, 18] as [bigint, number],
        }}
      />
    );
    const continueBtn = screen.getByTestId("continue-button");
    expect(continueBtn).toBeDisabled();
  });

  it("renders address and amount fields for burn", () => {
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
          BigIntField: (
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
            BigIntField: (props) => (
              <input data-testid="bigint-input" {...props} />
            ),
          })}
        </div>
      ),
      reset: vi.fn(),
      getFieldValue: vi.fn((name: string) =>
        name.startsWith("burn_address_")
          ? "0x1111111111111111111111111111111111111111"
          : 10n
      ),
      setFieldValue: vi.fn(),
    } as unknown as ReturnType<typeof useAppForm>);

    renderWithProviders(
      <BurnSheet
        open
        asset={createMockToken()}
        onOpenChange={() => {}}
        preset={{
          address: "0x1111111111111111111111111111111111111111",
          available: [100n, 18] as [bigint, number],
        }}
      />
    );
    expect(screen.getByTestId("bigint-input")).toBeInTheDocument();
  });

  it("submits burn mutation with batch arrays", async () => {
    const mockBurn = vi.fn().mockResolvedValue({});
    const { orpc } = await import("@/orpc/orpc-client");
    vi.mocked(orpc.token.burn.mutationOptions).mockReturnValue({
      mutationFn: mockBurn,
    } as ReturnType<typeof orpc.token.burn.mutationOptions>);

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
          BigIntField: (
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
            BigIntField: (props) => (
              <input data-testid="bigint-input" {...props} />
            ),
          })}
        </div>
      ),
      reset: vi.fn(),
      getFieldValue: vi.fn((name: string) =>
        name.startsWith("burn_address_")
          ? "0x1111111111111111111111111111111111111111"
          : 10n
      ),
      setFieldValue: vi.fn(),
    } as unknown as ReturnType<typeof useAppForm>);

    renderWithProviders(
      <BurnSheet
        open
        asset={createMockToken()}
        onOpenChange={() => {}}
        preset={{
          address: "0x1111111111111111111111111111111111111111",
          available: [100n, 18] as [bigint, number],
        }}
      />
    );
    const amt = screen.getByTestId("bigint-input");
    await user.type(amt, "10");
    await user.click(screen.getByTestId("submit-button"));
    expect(mockBurn).toHaveBeenCalled();
  });
});
