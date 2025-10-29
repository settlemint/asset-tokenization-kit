/**
 * @vitest-environment happy-dom
 */
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTableRowActions } from "./data-table-row-actions";

// Mock @tanstack/react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

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

describe("DataTableRowActions", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render nothing when no actions or detailUrl provided", () => {
      const { container } = renderWithProviders(<DataTableRowActions />);

      expect(container.firstChild).toBeNull();
    });

    it("should render details button when detailUrl provided", () => {
      renderWithProviders(<DataTableRowActions detailUrl="/items/123" />);

      const detailsLink = screen.getByRole("link", { name: "details" });
      expect(detailsLink).toBeInTheDocument();
      expect(detailsLink).toHaveAttribute("href", "/items/123");
    });

    it("should render dropdown menu when actions provided", () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
        { id: "delete", label: "Delete", component: undefined },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });
      expect(menuButton).toBeInTheDocument();
    });

    it("should render both details and actions when both provided", () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
      ];

      renderWithProviders(
        <DataTableRowActions detailUrl="/items/123" actions={actions} />
      );

      expect(screen.getByRole("link", { name: "details" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "openMenu" })
      ).toBeInTheDocument();
    });
  });

  describe("Dropdown Menu Interactions", () => {
    it("should show dropdown items when menu clicked", async () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
        { id: "delete", label: "Delete", component: undefined },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
      });
    });

    it("should handle disabled actions", async () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
        { id: "delete", label: "Delete", disabled: true, component: undefined },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });
      await user.click(menuButton);

      await waitFor(() => {
        const deleteItem = screen
          .getByText("Delete")
          .closest('[role="menuitem"]');
        expect(deleteItem).toHaveAttribute("aria-disabled", "true");
      });
    });

    it("should filter out hidden actions", async () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
        {
          id: "delete",
          label: "Delete",
          component: (<div>Delete Action</div>) as React.ReactNode,
          hidden: true,
        },
        {
          id: "archive",
          label: "Archive",
          component: (<div>Archive Action</div>) as React.ReactNode,
        },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Archive")).toBeInTheDocument();
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
      });
    });

    it("should close dropdown when item clicked", async () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
        { id: "delete", label: "Delete", component: undefined },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });
      await user.click(menuButton);

      const editItem = await screen.findByText("Edit");
      await user.click(editItem);

      await waitFor(() => {
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
      });
    });
  });

  describe("Action Components", () => {
    it("should render action component when item clicked", async () => {
      const TestComponent = () => <div>Test Action Component</div>;
      const actions = [
        {
          id: "custom",
          label: "Custom",
          component: (<TestComponent />) as React.ReactNode,
        },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });
      await user.click(menuButton);

      const customItem = await screen.findByText("Custom");
      await user.click(customItem);

      await waitFor(() => {
        expect(screen.getByText("Test Action Component")).toBeInTheDocument();
      });
    });

    it("should render function component with render props", async () => {
      const TestComponent = ({
        open,
        onOpenChange,
      }: {
        open: boolean;
        onOpenChange: (value: boolean) => void;
      }) => (
        <div>
          <span>Open: {open ? "true" : "false"}</span>
          <button
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Close
          </button>
        </div>
      );

      const actions = [
        { id: "func", label: "Function", component: TestComponent },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });
      await user.click(menuButton);

      const funcItem = await screen.findByText("Function");
      await user.click(funcItem);

      await waitFor(() => {
        expect(screen.getByText("Open: true")).toBeInTheDocument();
      });

      const closeButton = screen.getByText("Close");
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText("Open: true")).not.toBeInTheDocument();
      });
    });

    it("should handle multiple actions with components", async () => {
      const EditComponent = () => <div>Edit Form</div>;
      const DeleteComponent = () => <div>Delete Confirmation</div>;

      const actions = [
        { id: "edit", label: "Edit", component: <EditComponent /> },
        { id: "delete", label: "Delete", component: <DeleteComponent /> },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });

      // Click edit
      await user.click(menuButton);
      const editItem = await screen.findByText("Edit");
      await user.click(editItem);

      await waitFor(() => {
        expect(screen.getByText("Edit Form")).toBeInTheDocument();
      });

      // Click delete (should replace edit)
      await user.click(menuButton);
      const deleteItem = await screen.findByText("Delete");
      await user.click(deleteItem);

      await waitFor(() => {
        expect(screen.queryByText("Edit Form")).not.toBeInTheDocument();
        expect(screen.getByText("Delete Confirmation")).toBeInTheDocument();
      });
    });
  });

  describe("Styling and Props", () => {
    it("should apply custom className", () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
      ];

      renderWithProviders(
        <DataTableRowActions actions={actions} className="custom-class" />
      );

      const container = screen.getByRole("button", {
        name: "openMenu",
      }).parentElement;
      expect(container).toHaveClass("custom-class");
    });

    it("should apply variant styles", () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
      ];

      renderWithProviders(
        <DataTableRowActions actions={actions} variant="default" />
      );

      const container = screen.getByRole("button", {
        name: "openMenu",
      }).parentElement;
      expect(container).toHaveClass("flex", "items-center", "space-x-2");
    });

    it("should pass through additional HTML props", () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
      ];

      renderWithProviders(
        <DataTableRowActions
          actions={actions}
          data-testid="row-actions"
          aria-label="Row actions"
        />
      );

      const container = screen.getByTestId("row-actions");
      expect(container).toHaveAttribute("aria-label", "Row actions");
    });

    it("should apply press-effect class to buttons", () => {
      renderWithProviders(<DataTableRowActions detailUrl="/items/123" />);

      const detailsButton = screen.getByRole("link", { name: "details" });
      expect(detailsButton).toHaveClass("press-effect");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty actions array", () => {
      renderWithProviders(<DataTableRowActions actions={[]} />);

      // Should render nothing when actions array is empty
      const container = screen.queryByRole("button", { name: "openMenu" });
      expect(container).not.toBeInTheDocument();
    });

    it("should handle all actions being hidden", () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: <div>Edit Action</div>,
          hidden: true,
        },
        {
          id: "delete",
          label: "Delete",
          component: <div>Delete Action</div>,
          hidden: true,
        },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      // Should not render menu when all actions are hidden
      const menuButton = screen.queryByRole("button", { name: "openMenu" });
      expect(menuButton).not.toBeInTheDocument();
    });

    it("should handle menu state changes", async () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });

      // Open menu
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });

      // Menu state should be properly managed
      expect(menuButton).toHaveAttribute("aria-expanded", "true");
    });

    it("should manage menu visibility state", async () => {
      const actions = [
        {
          id: "edit",
          label: "Edit",
          component: (<div>Edit Action</div>) as React.ReactNode,
        },
      ];

      renderWithProviders(<DataTableRowActions actions={actions} />);

      const menuButton = screen.getByRole("button", { name: "openMenu" });

      // Verify initial state
      expect(menuButton).toHaveAttribute("aria-expanded", "false");

      // Open menu
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText("Edit")).toBeInTheDocument();
      });

      // Menu should be marked as expanded
      expect(menuButton).toHaveAttribute("aria-expanded", "true");
    });
  });
});
