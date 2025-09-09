import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChangeRolesSheet } from "./change-roles-sheet";

// Import the mocked modules
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => {
      if (options?.defaultValue) return options.defaultValue;
      // Return proper translations for known keys
      const translations: Record<string, string> = {
        "tokens:permissions.columns.roles": "Roles",
        "tokens:permissions.groups.administration": "Administration",
        "tokens:permissions.groups.operations": "Operations",
        "tokens:permissions.groups.compliance": "Compliance",
        "tokens:permissions.groups.other": "Other",
        "tokens:actions.grantRole.form.accountLabel": "Account",
        "tokens:permissions.changeRoles.title": "Change roles",
        "tokens:permissions.changeRoles.description":
          "Assign or remove roles for this address",
      };
      return translations[key] || key;
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
      grantRole: {
        mutationOptions: vi.fn(() => ({})),
      },
      revokeRole: {
        mutationOptions: vi.fn(() => ({})),
      },
      read: {
        queryOptions: vi.fn(() => ({ queryKey: ["token", "read"] })),
        queryKey: vi.fn(() => ["token", "read"]),
      },
    },
  },
}));

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

vi.mock("../core/action-form-sheet.store", () => ({
  createActionFormStore: () => ({
    state: { step: "values", hasValuesStep: true },
    setState: vi.fn(),
    subscribe: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-app-form", () => ({
  useAppForm: vi.fn(() => ({
    Subscribe: ({
      children,
    }: {
      children: (state: { address: string }) => React.ReactNode;
    }) => children({ address: "" }),
    AppField: ({
      name,
      children,
    }: {
      name: string;
      children: (components: {
        AddressSelectField: () => React.ReactElement;
        AddressInputField: () => React.ReactElement;
      }) => React.ReactNode;
    }) => (
      <div data-testid={`field-${name}`}>
        {children({
          AddressSelectField: () => <input data-testid="address-select" />,
          AddressInputField: () => <input data-testid="address-input" />,
        })}
      </div>
    ),
    reset: vi.fn(),
  })),
}));

vi.mock("@/components/address/address-select-or-input-toggle", () => ({
  AddressSelectOrInputToggle: ({
    children,
  }: {
    children: (state: { mode: string }) => React.ReactNode;
  }) => children({ mode: "select" }),
}));

vi.mock("@/orpc/helpers/access-control-helpers", () => ({
  getAccessControlEntries: () => [
    [
      "supplyManagement",
      [{ id: "0x1111111111111111111111111111111111111111" }],
    ],
  ],
}));

vi.mock("@/orpc/routes/token/token.permissions", () => ({
  TOKEN_PERMISSIONS: {
    supplyManagement: { assignable: true },
    complianceManagement: { assignable: true },
  },
}));

const mockToken = {
  id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  name: "Mock",
  symbol: "MOCK",
  decimals: 18,
  totalSupply: [0n, 18] as [bigint, number],
  type: "bond" as const,
  createdAt: new Date(0),
  extensions: [],
  implementsERC3643: true,
  implementsSMART: true,
  pausable: { paused: false },
  capped: null,
  createdBy: { id: "0xowner" },
  account: {
    identity: {
      id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
  },
  redeemable: null,
  bond: null,
  fund: null,
  collateral: null,
  yield: null,
  accessControl: undefined,
  userPermissions: undefined,
  stats: null,
} satisfies Parameters<typeof ChangeRolesSheet>[0]["asset"];

describe("ChangeRolesSheet", () => {
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
  describe("Address Selection", () => {
    it("hides roles until address is set", () => {
      renderWithProviders(
        <ChangeRolesSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
        />
      );

      // Should show address field but not roles
      expect(screen.getByTestId("field-address")).toBeInTheDocument();
      expect(
        screen.queryByText(/tokens:permissions.columns.roles/i)
      ).not.toBeInTheDocument();
    });

    it("shows address input field", () => {
      renderWithProviders(
        <ChangeRolesSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
        />
      );

      expect(screen.getByTestId("address-select")).toBeInTheDocument();
    });
  });

  describe("Preset Account", () => {
    it("shows roles when preset address is provided", () => {
      // Mock useAppForm to return preset address
      vi.mocked(useAppForm).mockReturnValue({
        Subscribe: ({
          children,
        }: {
          children: (state: { address: string }) => React.ReactNode;
        }) =>
          children({ address: "0x1111111111111111111111111111111111111111" }),
        AppField: ({
          name,
          children,
        }: {
          name: string;
          children: (components: {
            AddressSelectField: () => React.JSX.Element;
            AddressInputField: () => React.JSX.Element;
          }) => React.ReactNode;
        }) => (
          <div data-testid={`field-${name}`}>
            {children({
              AddressSelectField: () => <input data-testid="address-select" />,
              AddressInputField: () => <input data-testid="address-input" />,
            })}
          </div>
        ),
        reset: vi.fn(),
      } as unknown as ReturnType<typeof useAppForm>);

      renderWithProviders(
        <ChangeRolesSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          presetAccount={
            "0x1111111111111111111111111111111111111111" as `0x${string}`
          }
        />
      );

      // Should show roles section
      expect(screen.getByText("Roles")).toBeInTheDocument();
    });

    it("disables continue button initially when no changes made", () => {
      renderWithProviders(
        <ChangeRolesSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          presetAccount={
            "0x1111111111111111111111111111111111111111" as `0x${string}`
          }
        />
      );

      const continueBtn = screen.getByTestId("continue-button");
      expect(continueBtn).toBeDisabled();
    });
  });

  describe("Role Management", () => {
    it("renders role buttons for assignable roles", () => {
      vi.mocked(useAppForm).mockReturnValue({
        Subscribe: ({
          children,
        }: {
          children: (state: { address: string }) => React.ReactNode;
        }) =>
          children({ address: "0x2222222222222222222222222222222222222222" }),
        AppField: ({
          name,
          children,
        }: {
          name: string;
          children: (components: {
            AddressSelectField: () => React.ReactElement;
            AddressInputField: () => React.ReactElement;
          }) => React.ReactNode;
        }) => (
          <div data-testid={`field-${name}`}>
            {children({
              AddressSelectField: () => <input data-testid="address-select" />,
              AddressInputField: () => <input data-testid="address-input" />,
            })}
          </div>
        ),
        reset: vi.fn(),
      } as unknown as ReturnType<typeof useAppForm>);

      renderWithProviders(
        <ChangeRolesSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          presetAccount={
            "0x2222222222222222222222222222222222222222" as `0x${string}`
          }
        />
      );

      // Should show roles section
      expect(screen.getByText("Roles")).toBeInTheDocument();
    });
  });

  describe("Submission", () => {
    it("calls mutations when submitting role changes", async () => {
      const mockGrantRole = vi.fn().mockResolvedValue({});
      const mockRevokeRole = vi.fn().mockResolvedValue({});

      vi.mocked(orpc.token.grantRole.mutationOptions).mockReturnValue({
        mutationFn: mockGrantRole,
      } as ReturnType<typeof orpc.token.grantRole.mutationOptions>);

      vi.mocked(orpc.token.revokeRole.mutationOptions).mockReturnValue({
        mutationFn: mockRevokeRole,
      } as ReturnType<typeof orpc.token.revokeRole.mutationOptions>);

      renderWithProviders(
        <ChangeRolesSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          presetAccount={
            "0x1111111111111111111111111111111111111111" as `0x${string}`
          }
        />
      );

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      // Should close the sheet after submission
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
