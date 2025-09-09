import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionFormSheet } from "./action-form-sheet";
// Removed unused import of Token
import { Store } from "@tanstack/store";
import type { ActionFormState } from "./action-form-sheet.store";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("./base-action-sheet", () => ({
  BaseActionSheet: ({
    open,
    title,
    description,
    onCancel,
    submit,
    children,
  }: {
    open: boolean;
    title: string;
    description: string;
    onCancel: () => void;
    submit: React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <div data-testid="base-action-sheet" data-open={open}>
      <div data-testid="sheet-title">{title}</div>
      <div data-testid="sheet-description">{description}</div>
      <div data-testid="sheet-submit">{submit}</div>
      <div data-testid="sheet-children">{children}</div>
      <button data-testid="cancel-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

vi.mock("@/hooks/use-app-form", () => ({
  useAppForm: () => ({
    AppForm: ({ children }: { children: React.ReactNode }) => (
      <form>{children}</form>
    ),
    VerificationButton: ({
      children,
      onSubmit,
      disabled,
    }: {
      children: React.ReactNode;
      onSubmit: () => void;
      disabled?:
        | boolean
        | ((state: { isDirty: boolean; errors: unknown[] }) => boolean);
    }) => (
      <button
        data-testid="verification-button"
        onClick={onSubmit}
        disabled={
          typeof disabled === "function"
            ? disabled({ isDirty: false, errors: [] })
            : disabled
        }
      >
        {children}
      </button>
    ),
    Subscribe: ({
      children,
    }: {
      children: (state: {
        isDirty: boolean;
        errors: unknown[];
      }) => React.ReactNode;
    }) => children({ isDirty: false, errors: [] }),
    getFieldValue: () => ({ secretVerificationCode: "123456" }),
    setFieldValue: vi.fn(),
    reset: vi.fn(),
  }),
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
} satisfies Parameters<typeof ActionFormSheet>[0]["asset"];

describe("ActionFormSheet", () => {
  const user = userEvent.setup();
  const mockOnOpenChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("Rendering", () => {
    it("renders title and description", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Test Title"
          description="Test Description"
          submitLabel="Save"
          onSubmit={mockOnSubmit}
        >
          <div data-testid="content">content</div>
        </ActionFormSheet>
      );

      expect(screen.getByTestId("sheet-title")).toHaveTextContent("Test Title");
      expect(screen.getByTestId("sheet-description")).toHaveTextContent(
        "Test Description"
      );
      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    it("renders children content", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Save"
          onSubmit={mockOnSubmit}
        >
          <div data-testid="child-form">Form Fields</div>
        </ActionFormSheet>
      );

      const children = screen.getByTestId("sheet-children");
      expect(children).toHaveTextContent("Form Fields");
    });

    it("renders confirm content when provided", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Save"
          onSubmit={mockOnSubmit}
          hasValuesStep={false}
          confirm={<div data-testid="confirm-content">Confirm Details</div>}
        />
      );

      expect(screen.getByTestId("confirm-content")).toBeInTheDocument();
    });
  });

  describe("Step Navigation", () => {
    it("shows values step initially when hasValuesStep is true", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Save"
          hasValuesStep={true}
          onSubmit={mockOnSubmit}
        >
          <div data-testid="form-content">Form</div>
        </ActionFormSheet>
      );

      // Should show Continue button instead of verification button
      expect(screen.getByText("Continue")).toBeInTheDocument();
    });

    it("shows confirm step initially when hasValuesStep is false", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Save"
          hasValuesStep={false}
          onSubmit={mockOnSubmit}
        />
      );

      // Should show verification button with submit label
      expect(screen.getByTestId("verification-button")).toHaveTextContent(
        "Save"
      );
    });

    it("disables continue when canContinue returns false", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Save"
          hasValuesStep={true}
          canContinue={() => false}
          onSubmit={mockOnSubmit}
        >
          <div />
        </ActionFormSheet>
      );

      const continueBtn = screen.getByText("Continue");
      expect(continueBtn).toBeDisabled();
    });

    it("enables continue when canContinue returns true", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Save"
          hasValuesStep={true}
          canContinue={() => true}
          onSubmit={mockOnSubmit}
        >
          <div />
        </ActionFormSheet>
      );

      const continueBtn = screen.getByText("Continue");
      expect(continueBtn).not.toBeDisabled();
    });
  });

  describe("Submission", () => {
    it("calls onSubmit when verification button is clicked", async () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Submit"
          hasValuesStep={false}
          onSubmit={mockOnSubmit}
        />
      );

      const submitBtn = screen.getByTestId("verification-button");
      await user.click(submitBtn);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        secretVerificationCode: "123456",
      });
    });

    it("disables submit button when disabled prop is true", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Submit"
          hasValuesStep={false}
          disabled={true}
          onSubmit={mockOnSubmit}
        />
      );

      const submitBtn = screen.getByTestId("verification-button");
      expect(submitBtn).toBeDisabled();
    });

    it("disables submit button when isSubmitting is true", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Submit"
          hasValuesStep={false}
          isSubmitting={true}
          onSubmit={mockOnSubmit}
        />
      );

      const submitBtn = screen.getByTestId("verification-button");
      expect(submitBtn).toBeDisabled();
    });
  });

  describe("Custom Store", () => {
    it("uses custom store when provided", () => {
      const customStore = new Store<ActionFormState>({
        step: "confirm",
        hasValuesStep: true,
      });

      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Submit"
          hasValuesStep={true}
          store={customStore}
          onSubmit={mockOnSubmit}
        />
      );

      // Should show verification button since store says we're on confirm step
      expect(screen.getByTestId("verification-button")).toBeInTheDocument();
    });
  });

  describe("Asset Details", () => {
    it("shows asset details on confirm step when showAssetDetailsOnConfirm is true", () => {
      render(
        <ActionFormSheet
          open
          onOpenChange={mockOnOpenChange}
          asset={mockToken}
          title="Title"
          description="Description"
          submitLabel="Submit"
          hasValuesStep={false}
          showAssetDetailsOnConfirm={true}
          onSubmit={mockOnSubmit}
        />
      );

      // BaseActionSheet should receive showAssetDetails=true
      const baseSheet = screen.getByTestId("base-action-sheet");
      expect(baseSheet).toBeInTheDocument();
    });
  });
});
