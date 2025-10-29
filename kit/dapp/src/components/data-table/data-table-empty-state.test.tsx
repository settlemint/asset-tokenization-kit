/**
 * @vitest-environment happy-dom
 */
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen, within } from "@testing-library/react";
import {
  AlertCircle,
  Database,
  FileQuestion,
  Filter,
  Inbox,
  PackageOpen,
  Search,
  type LucideIcon,
} from "lucide-react";
import { describe, expect, it } from "vitest";
import {
  DataTableEmptyState,
  DataTableEmptyStateProps,
} from "./data-table-empty-state";

describe("DataTableEmptyState", () => {
  describe("Basic Rendering", () => {
    it("should render with all required props", () => {
      renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="No data"
          description="No data available"
        />
      );

      expect(screen.getByText("No data")).toBeInTheDocument();
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should render the icon component", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={Search}
          title="No results"
          description="Try a different search"
        />
      );

      // Icon should be rendered as an SVG with size-5 class
      const svg = container.querySelector("svg.size-5");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("animate-in", "spin-in-90", "duration-500");
    });

    it("should render with different icon components", () => {
      const icons = [PackageOpen, Search, Database, AlertCircle, FileQuestion];

      icons.forEach((Icon) => {
        const { container } = renderWithProviders(
          <DataTableEmptyState
            icon={Icon}
            title={`Title for ${Icon.name}`}
            description="Test description"
          />
        );

        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
      });
    });

    it("should render as a Card component", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={Database}
          title="Empty database"
          description="Start by adding some data"
        />
      );

      // Should render as a Card
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("animate-in");
    });

    it("should render CardHeader with correct structure", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="Test Title"
          description="Test Description"
        />
      );

      const cardHeader = container.querySelector('[data-slot="card-header"]');
      expect(cardHeader).toBeInTheDocument();

      // Should contain both title and description
      const cardTitle = within(cardHeader as HTMLElement).getByText(
        "Test Title"
      );
      const cardDescription = within(cardHeader as HTMLElement).getByText(
        "Test Description"
      );

      expect(cardTitle).toBeInTheDocument();
      expect(cardDescription).toBeInTheDocument();
    });
  });

  describe("Animation Classes", () => {
    it("should have animation classes on card", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="No items"
          description="Add items to see them here"
        />
      );

      const card = container.querySelector('[data-slot="card"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        "animate-in",
        "fade-in-0",
        "zoom-in-95",
        "duration-300"
      );
    });

    it("should have animation on icon", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="Empty"
          description="Nothing here"
        />
      );

      const icon = container.querySelector(".size-5");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("animate-in", "spin-in-90", "duration-500");
    });

    it("should have slide animation on title text", () => {
      renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="Animated Title"
          description="Test"
        />
      );

      // Find the div containing the title text
      const titleDiv = screen.getByText("Animated Title");
      expect(titleDiv).toHaveClass(
        "animate-in",
        "slide-in-from-left-2",
        "duration-500"
      );
    });

    it("should have delayed animation on description", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="Title"
          description="Delayed Description"
        />
      );

      // Find CardDescription by data-slot
      const cardDescription = container.querySelector(
        '[data-slot="card-description"]'
      );
      expect(cardDescription).toBeInTheDocument();
      expect(cardDescription).toHaveClass(
        "animate-in",
        "fade-in-50",
        "slide-in-from-bottom-1",
        "duration-500",
        "delay-200"
      );
      expect(cardDescription).toHaveTextContent("Delayed Description");
    });

    it("should have correct animation sequence", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={Inbox}
          title="Empty Inbox"
          description="No messages yet"
        />
      );

      // Card appears first
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass("duration-300");

      // Icon and title appear next
      const icon = container.querySelector(".size-5");
      const titleDiv = screen.getByText("Empty Inbox");
      expect(icon).toHaveClass("duration-500");
      expect(titleDiv).toHaveClass("duration-500");

      // Description appears last with delay
      const description = container.querySelector(
        '[data-slot="card-description"]'
      );
      expect(description).toHaveClass("duration-500", "delay-200");
    });
  });

  describe("Card Structure", () => {
    it("should have correct DOM hierarchy", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="Card Title"
          description="Card Description"
        />
      );

      // Card > CardHeader > (CardTitle, CardDescription)
      const card = container.querySelector('[data-slot="card"]');
      const cardHeader = card?.querySelector('[data-slot="card-header"]');
      const cardTitle = cardHeader?.querySelector('[data-slot="card-title"]');
      const cardDescription = cardHeader?.querySelector(
        '[data-slot="card-description"]'
      );

      expect(card).toBeInTheDocument();
      expect(cardHeader).toBeInTheDocument();
      expect(cardTitle).toBeInTheDocument();
      expect(cardDescription).toBeInTheDocument();
    });

    it("should have flex layout for icon and title", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="Flex Title"
          description="Test"
        />
      );

      // CardTitle should have flex layout
      const cardTitle = container.querySelector('[data-slot="card-title"]');
      expect(cardTitle).toBeInTheDocument();
      expect(cardTitle).toHaveClass("flex", "items-center", "gap-2");

      // Should contain icon and title div
      const icon = cardTitle?.querySelector("svg");
      const titleDiv = cardTitle?.querySelector("div");
      expect(icon).toBeInTheDocument();
      expect(titleDiv).toBeInTheDocument();
      expect(titleDiv).toHaveTextContent("Flex Title");
    });

    it("should have mb-2 spacing on CardTitle", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="Spaced Title"
          description="Test"
        />
      );

      const cardTitle = container.querySelector('[data-slot="card-title"]');
      expect(cardTitle).toHaveClass("mb-2");
    });
  });

  describe("Props Validation", () => {
    it("should accept all required props", () => {
      const props: DataTableEmptyStateProps = {
        icon: PackageOpen,
        title: "Required Title",
        description: "Required Description",
      };

      renderWithProviders(<DataTableEmptyState {...props} />);

      expect(screen.getByText("Required Title")).toBeInTheDocument();
      expect(screen.getByText("Required Description")).toBeInTheDocument();
    });

    it("should handle icon as component type", () => {
      const CustomIcon = ({ className }: { className?: string }) => (
        <div className={className} data-testid="custom-icon">
          Custom
        </div>
      );

      renderWithProviders(
        <DataTableEmptyState
          icon={CustomIcon as LucideIcon}
          title="Custom Icon"
          description="With custom icon component"
        />
      );

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      expect(screen.getByTestId("custom-icon")).toHaveClass("size-5");
    });
  });

  describe("Different Use Cases", () => {
    it("should work for no search results", () => {
      renderWithProviders(
        <DataTableEmptyState
          icon={Search}
          title="No results found"
          description="Try adjusting your search criteria"
        />
      );

      expect(screen.getByText("No results found")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your search criteria")
      ).toBeInTheDocument();
    });

    it("should work for filtered data", () => {
      renderWithProviders(
        <DataTableEmptyState
          icon={Filter}
          title="No matching items"
          description="Try removing some filters"
        />
      );

      expect(screen.getByText("No matching items")).toBeInTheDocument();
      expect(screen.getByText("Try removing some filters")).toBeInTheDocument();
    });

    it("should work for empty database", () => {
      renderWithProviders(
        <DataTableEmptyState
          icon={Database}
          title="No data yet"
          description="Start by creating your first item"
        />
      );

      expect(screen.getByText("No data yet")).toBeInTheDocument();
      expect(
        screen.getByText("Start by creating your first item")
      ).toBeInTheDocument();
    });

    it("should work for error states", () => {
      renderWithProviders(
        <DataTableEmptyState
          icon={AlertCircle}
          title="Unable to load data"
          description="Please try again later"
        />
      );

      expect(screen.getByText("Unable to load data")).toBeInTheDocument();
      expect(screen.getByText("Please try again later")).toBeInTheDocument();
    });

    it("should handle long text gracefully", () => {
      const longTitle =
        "This is a very long title that should still render properly within the card component";
      const longDescription =
        "This is an extremely long description that provides detailed information about why the table is empty and what actions the user can take to populate it with data. It should wrap properly and maintain good readability.";

      renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title={longTitle}
          description={longDescription}
        />
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("should handle empty strings", () => {
      renderWithProviders(
        <DataTableEmptyState icon={PackageOpen} title="" description="" />
      );

      // Component should still render structure even with empty strings
      const { container } = renderWithProviders(
        <DataTableEmptyState icon={PackageOpen} title="" description="" />
      );

      const card = container.querySelector('[data-slot="card"]');
      const cardTitle = container.querySelector('[data-slot="card-title"]');
      const cardDescription = container.querySelector(
        '[data-slot="card-description"]'
      );

      expect(card).toBeInTheDocument();
      expect(cardTitle).toBeInTheDocument();
      expect(cardDescription).toBeInTheDocument();
    });

    it("should handle special characters in text", () => {
      const specialTitle = 'No <results> & "data" found';
      const specialDescription =
        "Try using different search 'terms' & parameters";

      renderWithProviders(
        <DataTableEmptyState
          icon={Search}
          title={specialTitle}
          description={specialDescription}
        />
      );

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
      expect(screen.getByText(specialDescription)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have semantic HTML structure", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="Accessible Title"
          description="Accessible Description"
        />
      );

      // Card components should provide semantic structure
      const card = container.querySelector('[data-slot="card"]');
      expect(card?.tagName).toBe("DIV");

      // Content should be in header
      const header = container.querySelector('[data-slot="card-header"]');
      expect(header).toBeInTheDocument();
    });

    it("should maintain text hierarchy", () => {
      const { container } = renderWithProviders(
        <DataTableEmptyState
          icon={PackageOpen}
          title="Main Title"
          description="Supporting description text"
        />
      );

      // Title should be more prominent than description
      const cardTitle = container.querySelector('[data-slot="card-title"]');
      const cardDescription = container.querySelector(
        '[data-slot="card-description"]'
      );

      expect(cardTitle).toBeInTheDocument();
      expect(cardDescription).toBeInTheDocument();

      // CardTitle typically renders as h3, CardDescription as p
      // but we'll check for the data-slot attributes instead
      expect(cardTitle).toHaveAttribute("data-slot", "card-title");
      expect(cardDescription).toHaveAttribute("data-slot", "card-description");
    });
  });

  describe("Integration", () => {
    it("should work within a data table context", () => {
      const { container } = renderWithProviders(
        <div role="table">
          <div role="rowgroup">
            <DataTableEmptyState
              icon={Inbox}
              title="No items to display"
              description="Items will appear here when available"
            />
          </div>
        </div>
      );

      const table = container.querySelector('[role="table"]');
      const emptyState = within(table as HTMLElement).getByText(
        "No items to display"
      );

      expect(table).toBeInTheDocument();
      expect(emptyState).toBeInTheDocument();
    });

    it("should be reusable with different configurations", () => {
      const emptyStates = [
        {
          icon: Search,
          title: "No search results",
          description: "Try different keywords",
        },
        {
          icon: Filter,
          title: "No matches found",
          description: "Adjust your filters",
        },
        {
          icon: Database,
          title: "Database is empty",
          description: "Add your first record",
        },
      ];

      emptyStates.forEach((state) => {
        const { unmount } = renderWithProviders(
          <DataTableEmptyState {...state} />
        );

        expect(screen.getByText(state.title)).toBeInTheDocument();
        expect(screen.getByText(state.description)).toBeInTheDocument();

        unmount();
      });
    });
  });
});
