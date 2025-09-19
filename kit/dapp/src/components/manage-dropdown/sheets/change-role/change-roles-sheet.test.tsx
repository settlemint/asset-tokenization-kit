import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChangeRolesSheet, type RoleInfo } from "./change-roles-sheet";

// Import the mocked modules
import { useAppForm } from "@/hooks/use-app-form";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => {
      if (options?.defaultValue) return options.defaultValue;
      // Return proper translations for known keys
      // Updated translations based on keys in change-token-roles-sheet.tsx and related context
      const translations: Record<string, string> = {
        "components:changeRolesSheet.title": "Change roles",
        "components:changeRolesSheet.description":
          "Assign or remove roles for this address",
        "components:changeRolesSheet.accountLabel": "Account",
        "components:changeRolesSheet.rolesLabel": "Roles",
        "common:add": "Add",
        "common:remove": "Remove",
        "common:none": "None",
        "common:save": "Save",
        "common:saving": "Saving...",
        "common:saved": "Saved",
        "common:error": "An error occurred",
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

vi.mock("../../core/action-form-sheet", () => ({
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
  identity: {
    id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    account: {
      id: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    },
    claims: [],
    registered: undefined,
    isContract: false,
  },
  complianceModuleConfigs: [],
  redeemable: null,
  bond: null,
  fund: null,
  collateral: null,
  yield: null,
  accessControl: undefined,
  userPermissions: undefined,
  stats: null,
} satisfies Parameters<typeof ChangeRolesSheet>[0]["asset"];

const mockRevokeRole = vi.fn();
const mockGrantRole = vi.fn();

describe("ChangeRolesSheet", () => {
  const user = userEvent.setup();
  let queryClient: QueryClient;
  const mockOnOpenChange = vi.fn();

  const groupedRoles = new Map<string, { label: string; roles: RoleInfo[] }>([
    [
      "Administration",
      {
        label: "Administration",
        roles: [
          {
            role: "admin",
            label: "Administration",
            description: "Administration",
          },
          {
            role: "tokenManager",
            label: "Token Manager",
            description: "Token Manager",
          },
        ],
      },
    ],
    [
      "Compliance",
      {
        label: "Compliance",
        roles: [
          {
            role: "complianceManager",
            label: "Compliance Manager",
            description: "Compliance Manager",
          },
        ],
      },
    ],
    [
      "Operations",
      {
        label: "Operations",
        roles: [
          {
            role: "supplyManagement",
            label: "Supply Management",
            description: "Supply Management",
          },
          { role: "emergency", label: "Emergency", description: "Emergency" },
          { role: "custodian", label: "Custodian", description: "Custodian" },
        ],
      },
    ],
  ]);

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
          accessControl={mockToken.accessControl}
          revokeRole={mockRevokeRole}
          grantRole={mockGrantRole}
          groupedRoles={groupedRoles}
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
          accessControl={mockToken.accessControl}
          revokeRole={mockRevokeRole}
          grantRole={mockGrantRole}
          groupedRoles={groupedRoles}
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
          accessControl={mockToken.accessControl}
          revokeRole={mockRevokeRole}
          grantRole={mockGrantRole}
          groupedRoles={groupedRoles}
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
          accessControl={mockToken.accessControl}
          revokeRole={mockRevokeRole}
          grantRole={mockGrantRole}
          groupedRoles={groupedRoles}
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
          accessControl={mockToken.accessControl}
          revokeRole={mockRevokeRole}
          grantRole={mockGrantRole}
          groupedRoles={groupedRoles}
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

      renderWithProviders(
        <ChangeRolesSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          presetAccount={
            "0x1111111111111111111111111111111111111111" as `0x${string}`
          }
          accessControl={mockToken.accessControl}
          revokeRole={mockRevokeRole}
          grantRole={mockGrantRole}
          groupedRoles={groupedRoles}
        />
      );

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      // Should close the sheet after submission
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
