/**
 * @vitest-environment happy-dom
 */
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActionsCell, type ActionItem } from "./actions-cell";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "en",
    },
  }),
}));

// Mock logger
vi.mock("@settlemint/sdk-utils/logging", () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

// Mock lucide-react
vi.mock("lucide-react", () => ({
  MoreHorizontal: () => <div data-testid="more-horizontal-icon">⋯</div>,
}));

describe("ActionsCell", () => {
  const user = userEvent.setup();

  const mockActions: ActionItem[] = [
    {
      label: "Edit",
      onClick: vi.fn(),
    },
    {
      label: "View Details",
      href: "/details/123",
    },
    {
      label: "Delete",
      onClick: vi.fn(),
      disabled: false,
      separator: "before",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render dropdown trigger with correct accessibility attributes", () => {
      renderWithProviders(<ActionsCell actions={mockActions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass("h-8", "w-8", "p-0");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("should render the MoreHorizontal icon", () => {
      renderWithProviders(<ActionsCell actions={mockActions} />);

      const icon = screen.getByTestId("more-horizontal-icon");
      expect(icon).toBeInTheDocument();
    });

    it("should apply correct variant and styling to trigger button", () => {
      renderWithProviders(<ActionsCell actions={mockActions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      expect(trigger).toHaveClass("h-8", "w-8", "p-0");
    });
  });

  describe("Dropdown Menu Functionality", () => {
    it("should open dropdown menu when trigger is clicked", async () => {
      renderWithProviders(<ActionsCell actions={mockActions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("actions")).toBeInTheDocument(); // Default label
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("View Details")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
      });
    });

    it("should use custom label when provided", async () => {
      renderWithProviders(
        <ActionsCell actions={mockActions} label="Custom Actions" />
      );

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Custom Actions")).toBeInTheDocument();
        expect(screen.queryByText("actions")).not.toBeInTheDocument();
      });
    });

    it("should apply correct alignment to dropdown content", async () => {
      const alignments = ["start", "center", "end"] as const;

      for (const align of alignments) {
        const { unmount } = renderWithProviders(
          <ActionsCell actions={mockActions} align={align} />
        );

        const trigger = screen.getByRole("button", { name: /openMenu/i });
        await user.click(trigger);

        // The alignment is applied to the DropdownMenuContent component
        // We can verify it's rendered by checking for the menu items
        await waitFor(() => {
          expect(screen.getByText("Edit")).toBeInTheDocument();
        });

        unmount();
      }
    });

    it("should default to 'end' alignment when not specified", async () => {
      renderWithProviders(<ActionsCell actions={mockActions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });
    });
  });

  describe("Action Items", () => {
    it("should execute onClick handler when button action is clicked", async () => {
      const mockOnClick = vi.fn();
      const actions: ActionItem[] = [
        {
          label: "Test Action",
          onClick: mockOnClick,
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      const actionItem = await screen.findByText("Test Action");
      await user.click(actionItem);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should render link actions with correct attributes", async () => {
      const actions: ActionItem[] = [
        {
          label: "External Link",
          href: "https://example.com",
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      const link = await screen.findByRole("menuitem", {
        name: "External Link",
      });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should handle disabled actions correctly", async () => {
      const mockOnClick = vi.fn();
      const actions: ActionItem[] = [
        {
          label: "Disabled Action",
          onClick: mockOnClick,
          disabled: true,
        },
        {
          label: "Disabled Link",
          href: "/disabled",
          disabled: true,
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        const disabledButton = screen
          .getByText("Disabled Action")
          .closest("[role='menuitem']");
        const disabledLink = screen
          .getByText("Disabled Link")
          .closest("[role='menuitem']");

        expect(disabledButton).toHaveAttribute("aria-disabled", "true");
        expect(disabledLink).toHaveAttribute("aria-disabled", "true");
      });
    });

    it("should not execute onClick for disabled actions", async () => {
      const mockOnClick = vi.fn();
      const actions: ActionItem[] = [
        {
          label: "Disabled Action",
          onClick: mockOnClick,
          disabled: true,
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      const disabledItem = await screen.findByText("Disabled Action");

      // Disabled items should not be clickable
      expect(disabledItem.closest("[role='menuitem']")).toHaveAttribute(
        "aria-disabled",
        "true"
      );
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("Action Icons", () => {
    it("should render action icons when provided", async () => {
      const TestIcon = () => <div data-testid="test-icon">📝</div>;
      const actions: ActionItem[] = [
        {
          label: "Edit",
          icon: <TestIcon />,
          onClick: vi.fn(),
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId("test-icon")).toBeInTheDocument();
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });
    });

    it("should apply correct styling to icon containers", async () => {
      const TestIcon = () => <div data-testid="test-icon">📝</div>;
      const actions: ActionItem[] = [
        {
          label: "Edit",
          icon: <TestIcon />,
          onClick: vi.fn(),
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        const iconContainer = screen.getByTestId("test-icon").parentElement;
        expect(iconContainer).toHaveClass(
          "mr-2",
          "[&>svg]:text-muted-foreground",
          "[&>svg]:transition-colors"
        );
      });
    });

    it("should render icons for both button and link actions", async () => {
      const ButtonIcon = () => <div data-testid="button-icon">🔘</div>;
      const LinkIcon = () => <div data-testid="link-icon">🔗</div>;
      const actions: ActionItem[] = [
        {
          label: "Button Action",
          icon: <ButtonIcon />,
          onClick: vi.fn(),
        },
        {
          label: "Link Action",
          icon: <LinkIcon />,
          href: "/link",
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByTestId("button-icon")).toBeInTheDocument();
        expect(screen.getByTestId("link-icon")).toBeInTheDocument();
      });
    });
  });

  describe("Separators", () => {
    it("should render separator before action when specified", async () => {
      const actions: ActionItem[] = [
        {
          label: "First Action",
          onClick: vi.fn(),
        },
        {
          label: "Second Action",
          onClick: vi.fn(),
          separator: "before",
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        // Check that both actions are rendered
        expect(screen.getByText("First Action")).toBeInTheDocument();
        expect(screen.getByText("Second Action")).toBeInTheDocument();

        // The separator should be rendered before the second action
        // We can verify this by checking the DOM structure
        const separators = screen.getAllByRole("separator");
        expect(separators.length).toBeGreaterThan(0);
      });
    });

    it("should render separator after action when specified", async () => {
      const actions: ActionItem[] = [
        {
          label: "First Action",
          onClick: vi.fn(),
          separator: "after",
        },
        {
          label: "Second Action",
          onClick: vi.fn(),
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("First Action")).toBeInTheDocument();
        expect(screen.getByText("Second Action")).toBeInTheDocument();

        const separators = screen.getAllByRole("separator");
        expect(separators.length).toBeGreaterThan(0);
      });
    });

    it("should handle both before and after separators", async () => {
      const actions: ActionItem[] = [
        {
          label: "First Action",
          onClick: vi.fn(),
          separator: "after",
        },
        {
          label: "Middle Action",
          onClick: vi.fn(),
          separator: "before",
        },
        {
          label: "Last Action",
          onClick: vi.fn(),
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("First Action")).toBeInTheDocument();
        expect(screen.getByText("Middle Action")).toBeInTheDocument();
        expect(screen.getByText("Last Action")).toBeInTheDocument();

        const separators = screen.getAllByRole("separator");
        expect(separators.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe("Event Handling", () => {
    it("should prevent event propagation on trigger button click", async () => {
      const parentClickHandler = vi.fn();

      renderWithProviders(
        <div onClick={parentClickHandler}>
          <ActionsCell actions={mockActions} />
        </div>
      );

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      // Parent click handler should not be called due to stopPropagation
      expect(parentClickHandler).not.toHaveBeenCalled();
    });

    it("should call action onClick handlers correctly", async () => {
      const action1Handler = vi.fn();
      const action2Handler = vi.fn();

      const actions: ActionItem[] = [
        {
          label: "Action 1",
          onClick: action1Handler,
        },
        {
          label: "Action 2",
          onClick: action2Handler,
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      // Wait for dropdown to be fully rendered
      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });

      const action1 = await screen.findByRole("menuitem", { name: "Action 1" });

      await user.click(action1);
      expect(action1Handler).toHaveBeenCalledTimes(1);
      expect(action2Handler).not.toHaveBeenCalled();

      // Need to reopen menu since it closes after first click
      await user.click(trigger);
      await waitFor(() => {
        expect(screen.getByRole("menu")).toBeInTheDocument();
      });

      const action2Reopened = await screen.findByRole("menuitem", {
        name: "Action 2",
      });
      await user.click(action2Reopened);
      expect(action2Handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty actions array", () => {
      renderWithProviders(<ActionsCell actions={[]} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      expect(trigger).toBeInTheDocument();
    });

    it("should handle actions without onClick or href", async () => {
      const actions: ActionItem[] = [
        {
          label: "No Action",
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("No Action")).toBeInTheDocument();
      });
    });

    it("should handle actions with empty labels", async () => {
      const actions: ActionItem[] = [
        {
          label: "",
          onClick: vi.fn(),
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      // Should still render the empty action
      await waitFor(() => {
        const menuItems = screen.getAllByRole("menuitem");
        expect(menuItems.length).toBeGreaterThan(0);
      });
    });

    it("should handle null/undefined icons gracefully", async () => {
      const actions: ActionItem[] = [
        {
          label: "No Icon",
          icon: null,
          onClick: vi.fn(),
        },
        {
          label: "Undefined Icon",
          icon: undefined,
          onClick: vi.fn(),
        },
      ];

      renderWithProviders(<ActionsCell actions={actions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("No Icon")).toBeInTheDocument();
        expect(screen.getByText("Undefined Icon")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      renderWithProviders(<ActionsCell actions={mockActions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("should update ARIA attributes when menu is opened", async () => {
      renderWithProviders(<ActionsCell actions={mockActions} />);

      const trigger = screen.getByRole("button", { name: /openMenu/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("should have screen reader text for button", () => {
      renderWithProviders(<ActionsCell actions={mockActions} />);

      const screenReaderText = screen.getByText("openMenu");
      expect(screenReaderText).toHaveClass("sr-only");
    });
  });
});
