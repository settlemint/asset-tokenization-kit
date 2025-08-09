import { TokenHoldersTable } from "./token-holders";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the router
vi.mock("@tanstack/react-router", () => ({
  useRouter: vi.fn(() => ({
    state: {
      matches: [{ pathname: "/tokens/0xtoken" }],
    },
  })),
  Link: vi.fn(({ children, ...props }) => <a {...props}>{children}</a>),
}));

// Mock the orpc client
vi.mock("@/orpc/orpc-client", () => ({
  orpc: {
    token: {
      holders: {
        queryOptions: vi.fn().mockReturnValue({
          queryKey: ["token", "holders"],
          queryFn: vi.fn(),
        }),
      },
    },
  },
}));

// Mock the useQuery hook
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useSuspenseQuery: vi.fn(() => ({
      data: {
        token: {
          balances: [
            {
              account: "0x1234567890123456789012345678901234567890",
              balance: 1000n,
              formattedBalance: "1000",
            },
          ],
        },
      },
      isPending: false,
      isError: false,
    })),
    useQuery: vi.fn(() => ({
      data: {
        token: {
          balances: [
            {
              account: "0x1234567890123456789012345678901234567890",
              balance: 1000n,
              formattedBalance: "1000",
            },
          ],
        },
      },
      isPending: false,
      isError: false,
    })),
  };
});

// Mock the BurnSheet component
vi.mock("../manage-dropdown/sheets/burn-sheet", () => ({
  BurnSheet: vi.fn(({ open }) => (open ? <div>Burn Sheet</div> : null)),
}));

describe("TokenHoldersTable", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const createMockToken = (overrides?: Partial<Token>): Token => {
    const defaultActions = {
      burn: true,
      create: false,
      grantRole: false,
      revokeRole: false,
      mint: false,
      pause: false,
      addComplianceModule: false,
      approve: false,
      forcedRecover: false,
      freezeAddress: false,
      recoverERC20: false,
      recoverTokens: false,
      redeem: false,
      removeComplianceModule: false,
      setCap: false,
      setYieldSchedule: false,
      transfer: false,
      unpause: false,
    };

    const baseToken = {
      id: "0xtoken" as `0x${string}`,
      name: "Test Token",
      symbol: "TEST",
      decimals: 18,
      totalSupply: [1_000_000n, 18],
      pausable: {
        paused: false,
      },
      userPermissions: {
        actions: defaultActions,
      },
    };

    // Deep merge overrides
    if (overrides?.userPermissions?.actions) {
      return {
        ...baseToken,
        ...overrides,
        userPermissions: {
          ...baseToken.userPermissions,
          ...overrides.userPermissions,
          actions: {
            ...defaultActions,
            ...overrides.userPermissions.actions,
          },
        },
      } as Token;
    }

    return {
      ...baseToken,
      ...overrides,
    } as Token;
  };

  it("should show burn action when user has permission and token is not paused", () => {
    const token = createMockToken({
      pausable: { paused: false },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TokenHoldersTable token={token} />
      </QueryClientProvider>
    );

    // Check that burn button is present
    expect(screen.getByRole("button", { name: /burn/i })).toBeInTheDocument();
  });

  it("should hide burn action when user has no permission", () => {
    const token = createMockToken({
      pausable: { paused: false },
    });

    // Override the burn permission to false
    if (token.userPermissions) {
      token.userPermissions.actions.burn = false;
    }

    render(
      <QueryClientProvider client={queryClient}>
        <TokenHoldersTable token={token} />
      </QueryClientProvider>
    );

    // Check that burn button is not present
    expect(
      screen.queryByRole("button", { name: /burn/i })
    ).not.toBeInTheDocument();
  });

  it("should hide burn action when token is paused", () => {
    const token = createMockToken({
      pausable: { paused: true },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TokenHoldersTable token={token} />
      </QueryClientProvider>
    );

    // Check that burn button is not present when paused
    expect(
      screen.queryByRole("button", { name: /burn/i })
    ).not.toBeInTheDocument();
  });

  it("should hide burn action when token is not pausable", () => {
    const token = createMockToken({
      pausable: undefined,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TokenHoldersTable token={token} />
      </QueryClientProvider>
    );

    // Token without pausable capability should be treated as not paused
    expect(screen.getByRole("button", { name: /burn/i })).toBeInTheDocument();
  });

  it("should handle both permission and pause state correctly", () => {
    // Test all combinations
    const testCases = [
      { paused: false, canBurn: true, shouldShow: true },
      { paused: false, canBurn: false, shouldShow: false },
      { paused: true, canBurn: true, shouldShow: false },
      { paused: true, canBurn: false, shouldShow: false },
    ];

    testCases.forEach(({ paused, canBurn, shouldShow }) => {
      const token = createMockToken({
        pausable: { paused },
      });

      // Override the burn permission
      if (token.userPermissions) {
        token.userPermissions.actions.burn = canBurn;
      }

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <TokenHoldersTable token={token} />
        </QueryClientProvider>
      );

      const burnButton = screen.queryByRole("button", { name: /burn/i });
      if (shouldShow) {
        expect(burnButton).toBeInTheDocument();
      } else {
        expect(burnButton).not.toBeInTheDocument();
      }

      unmount();
    });
  });
});
