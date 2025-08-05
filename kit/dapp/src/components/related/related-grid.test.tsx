import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  RelatedGrid,
  RelatedGridContent,
  RelatedGridDescription,
  RelatedGridHeader,
  RelatedGridItem,
  RelatedGridItemContent,
  RelatedGridItemDescription,
  RelatedGridItemFooter,
  RelatedGridItemHeader,
  RelatedGridItemTitle,
  RelatedGridTitle,
} from "./related-grid";

describe("RelatedGrid", () => {
  describe("RelatedGrid Container", () => {
    it("should render with default gap", () => {
      render(<RelatedGrid data-testid="grid">Content</RelatedGrid>);
      const grid = screen.getByTestId("grid");
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass("flex", "flex-col", "gap-4");
    });

    it("should apply custom gap variant", () => {
      render(
        <RelatedGrid data-testid="grid" gap="lg">
          Content
        </RelatedGrid>
      );
      const grid = screen.getByTestId("grid");
      expect(grid).toHaveClass("gap-6");
    });

    it("should apply custom className", () => {
      render(
        <RelatedGrid data-testid="grid" className="custom-class">
          Content
        </RelatedGrid>
      );
      const grid = screen.getByTestId("grid");
      expect(grid).toHaveClass("custom-class");
    });

    it("should have correct data-slot attribute", () => {
      render(<RelatedGrid>Content</RelatedGrid>);
      const grid = document.querySelector('[data-slot="related-grid"]');
      expect(grid).toBeInTheDocument();
    });

    it("should render as custom element with asChild", () => {
      render(
        <RelatedGrid asChild>
          <section data-testid="custom">Content</section>
        </RelatedGrid>
      );
      const element = screen.getByTestId("custom");
      expect(element.tagName).toBe("SECTION");
      expect(element).toHaveClass("flex", "flex-col", "gap-4");
    });
  });

  describe("RelatedGridHeader", () => {
    it("should render header with correct classes", () => {
      render(
        <RelatedGridHeader data-testid="header">Header</RelatedGridHeader>
      );
      const header = screen.getByTestId("header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("flex", "flex-col", "space-y-1.5");
    });

    it("should have correct data-slot attribute", () => {
      render(<RelatedGridHeader>Header</RelatedGridHeader>);
      const header = document.querySelector(
        '[data-slot="related-grid-header"]'
      );
      expect(header).toBeInTheDocument();
    });
  });

  describe("RelatedGridTitle", () => {
    it("should render as h2 by default", () => {
      render(<RelatedGridTitle>Title</RelatedGridTitle>);
      const title = screen.getByText("Title");
      expect(title.tagName).toBe("H2");
      expect(title).toHaveClass("text-2xl", "font-semibold");
    });

    it("should render as custom element with asChild", () => {
      render(
        <RelatedGridTitle asChild>
          <h1>Custom Title</h1>
        </RelatedGridTitle>
      );
      const title = screen.getByText("Custom Title");
      expect(title.tagName).toBe("H1");
    });
  });

  describe("RelatedGridDescription", () => {
    it("should render with muted styles", () => {
      render(<RelatedGridDescription>Description</RelatedGridDescription>);
      const description = screen.getByText("Description");
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });
  });

  describe("RelatedGridContent", () => {
    it("should render with default columns", () => {
      render(
        <RelatedGridContent data-testid="content">
          <div>Item 1</div>
          <div>Item 2</div>
        </RelatedGridContent>
      );
      const content = screen.getByTestId("content");
      expect(content).toHaveClass("grid", "lg:grid-cols-3");
    });

    it("should apply custom column variant", () => {
      render(
        <RelatedGridContent data-testid="content" columns={2}>
          <div>Item 1</div>
          <div>Item 2</div>
        </RelatedGridContent>
      );
      const content = screen.getByTestId("content");
      expect(content).toHaveClass("sm:grid-cols-2");
    });

    it("should apply auto-fit columns", () => {
      render(
        <RelatedGridContent data-testid="content" columns="auto-fit">
          <div>Item</div>
        </RelatedGridContent>
      );
      const content = screen.getByTestId("content");
      expect(content).toHaveClass(
        "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
      );
    });

    it("should add animation classes when animate is true", () => {
      render(
        <RelatedGridContent animate>
          <div data-testid="item1">Item 1</div>
          <div data-testid="item2">Item 2</div>
        </RelatedGridContent>
      );
      const item1 = screen.getByTestId("item1");
      const item2 = screen.getByTestId("item2");
      expect(item1).toHaveClass("animate-in-grid");
      expect(item2).toHaveClass("animate-in-grid");
    });

    it("should preserve existing classes when adding animation", () => {
      render(
        <RelatedGridContent animate>
          <div data-testid="item" className="existing-class">
            Item
          </div>
        </RelatedGridContent>
      );
      const item = screen.getByTestId("item");
      expect(item).toHaveClass("existing-class", "animate-in-grid");
    });

    it("should handle non-element children when animate is true", () => {
      render(
        <RelatedGridContent data-testid="content" animate>
          {/* Text node */}
          Some text
          {/* React element */}
          <div data-testid="element">Element</div>
          {/* Null */}
          {null}
          {/* Boolean */}
          {false}
          {/* Number */}
          {123}
        </RelatedGridContent>
      );
      const content = screen.getByTestId("content");
      expect(content).toBeInTheDocument();
      // Text should be rendered but not have animation class
      expect(content).toHaveTextContent("Some text");
      expect(content).toHaveTextContent("123");
      // Only the div element should have animation class
      const element = screen.getByTestId("element");
      expect(element).toHaveClass("animate-in-grid");
    });

    it("should handle empty children gracefully", () => {
      render(
        <RelatedGridContent data-testid="content" animate>
          {null}
          {undefined}
          {false}
        </RelatedGridContent>
      );
      const content = screen.getByTestId("content");
      expect(content).toBeInTheDocument();
      expect(content).toBeEmptyDOMElement();
    });

    it("should handle mixed valid and invalid elements", () => {
      const { container } = render(
        <RelatedGridContent animate>
          <span data-testid="valid1">Valid 1</span>
          {"text node"}
          <span data-testid="valid2">Valid 2</span>
        </RelatedGridContent>
      );

      expect(screen.getByTestId("valid1")).toHaveClass("animate-in-grid");
      expect(screen.getByTestId("valid2")).toHaveClass("animate-in-grid");
      expect(container).toHaveTextContent("text node");
    });
  });

  describe("RelatedGridItem", () => {
    it("should render with default variant", () => {
      render(<RelatedGridItem data-testid="item">Item</RelatedGridItem>);
      const item = screen.getByTestId("item");
      expect(item).toHaveClass("linear-gradient-related", "p-6");
    });

    it("should apply different variants", () => {
      render(
        <RelatedGridItem data-testid="item" variant="default">
          Item
        </RelatedGridItem>
      );
      const item = screen.getByTestId("item");
      expect(item).toHaveClass("border", "bg-card");
    });

    it("should apply interactive classes", () => {
      render(
        <RelatedGridItem data-testid="item" interactive>
          Item
        </RelatedGridItem>
      );
      const item = screen.getByTestId("item");
      expect(item).toHaveClass("cursor-pointer", "hover-lift", "press-effect");
    });

    it("should apply different padding sizes", () => {
      render(
        <RelatedGridItem data-testid="item" padding="sm">
          Item
        </RelatedGridItem>
      );
      const item = screen.getByTestId("item");
      expect(item).toHaveClass("p-4");
    });

    it("should have correct data-slot attribute", () => {
      render(<RelatedGridItem>Item</RelatedGridItem>);
      const item = document.querySelector('[data-slot="related-grid-item"]');
      expect(item).toBeInTheDocument();
    });
  });

  describe("RelatedGridItem sub-components", () => {
    it("should render item header with correct classes", () => {
      render(
        <RelatedGridItemHeader data-testid="header">
          Header
        </RelatedGridItemHeader>
      );
      const header = screen.getByTestId("header");
      expect(header).toHaveClass("flex", "items-center", "justify-between");
    });

    it("should render item title as h3", () => {
      render(<RelatedGridItemTitle>Item Title</RelatedGridItemTitle>);
      const title = screen.getByText("Item Title");
      expect(title.tagName).toBe("H3");
      expect(title).toHaveClass("text-lg", "font-semibold");
    });

    it("should render item description with muted styles", () => {
      render(
        <RelatedGridItemDescription>Description</RelatedGridItemDescription>
      );
      const description = screen.getByText("Description");
      expect(description).toHaveClass("text-sm", "text-muted-foreground");
    });

    it("should render item content with flex-1", () => {
      render(
        <RelatedGridItemContent data-testid="content">
          Content
        </RelatedGridItemContent>
      );
      const content = screen.getByTestId("content");
      expect(content).toHaveClass("flex-1");
    });

    it("should render item footer with padding", () => {
      render(
        <RelatedGridItemFooter data-testid="footer">
          Footer
        </RelatedGridItemFooter>
      );
      const footer = screen.getByTestId("footer");
      expect(footer).toHaveClass("flex", "items-center", "pt-4");
    });
  });

  describe("Compound composition", () => {
    it("should render complete grid structure", () => {
      render(
        <RelatedGrid>
          <RelatedGridHeader>
            <RelatedGridTitle>Grid Title</RelatedGridTitle>
            <RelatedGridDescription>Grid Description</RelatedGridDescription>
          </RelatedGridHeader>
          <RelatedGridContent columns={3}>
            <RelatedGridItem>
              <RelatedGridItemContent>
                <RelatedGridItemTitle>Item Title</RelatedGridItemTitle>
                <RelatedGridItemDescription>
                  Item Description
                </RelatedGridItemDescription>
              </RelatedGridItemContent>
              <RelatedGridItemFooter>Footer Content</RelatedGridItemFooter>
            </RelatedGridItem>
          </RelatedGridContent>
        </RelatedGrid>
      );

      expect(screen.getByText("Grid Title")).toBeInTheDocument();
      expect(screen.getByText("Grid Description")).toBeInTheDocument();
      expect(screen.getByText("Item Title")).toBeInTheDocument();
      expect(screen.getByText("Item Description")).toBeInTheDocument();
      expect(screen.getByText("Footer Content")).toBeInTheDocument();
    });
  });

  describe("Additional coverage tests", () => {
    it("should handle all gap variants for RelatedGrid", () => {
      const gaps = ["sm", "md", "lg", "xl"] as const;
      gaps.forEach((gap) => {
        render(
          <RelatedGrid gap={gap} data-testid={`grid-${gap}`}>
            Content
          </RelatedGrid>
        );
        const grid = screen.getByTestId(`grid-${gap}`);
        expect(grid).toHaveClass(
          gap === "sm"
            ? "gap-2"
            : gap === "md"
              ? "gap-4"
              : gap === "lg"
                ? "gap-6"
                : "gap-8"
        );
      });
    });

    it("should handle all column variants for RelatedGridContent", () => {
      const columns = [1, 2, 3, 4, "auto-fit", "auto-fill"] as const;
      columns.forEach((col) => {
        render(
          <RelatedGridContent columns={col} data-testid={`content-${col}`}>
            <div>Item</div>
          </RelatedGridContent>
        );
        const content = screen.getByTestId(`content-${col}`);
        expect(content).toBeInTheDocument();
      });
    });

    it("should handle all gap variants for RelatedGridContent", () => {
      const gaps = ["sm", "md", "lg", "xl"] as const;
      gaps.forEach((gap) => {
        render(
          <RelatedGridContent gap={gap} data-testid={`content-gap-${gap}`}>
            <div>Item</div>
          </RelatedGridContent>
        );
        const content = screen.getByTestId(`content-gap-${gap}`);
        expect(content).toHaveClass(
          gap === "sm"
            ? "gap-2"
            : gap === "md"
              ? "gap-4"
              : gap === "lg"
                ? "gap-6"
                : "gap-8"
        );
      });
    });

    it("should handle all variant combinations for RelatedGridItem", () => {
      const variants = ["default", "gradient", "outline", "ghost"] as const;
      const paddings = ["none", "sm", "md", "lg"] as const;

      variants.forEach((variant) => {
        paddings.forEach((padding) => {
          render(
            <RelatedGridItem
              variant={variant}
              padding={padding}
              data-testid={`item-${variant}-${padding}`}
            >
              Item
            </RelatedGridItem>
          );
          const item = screen.getByTestId(`item-${variant}-${padding}`);
          expect(item).toBeInTheDocument();
        });
      });
    });

    it("should handle asChild prop for all components", () => {
      // Test RelatedGridHeader with asChild
      render(
        <RelatedGridHeader asChild>
          <header data-testid="custom-header">Header</header>
        </RelatedGridHeader>
      );
      expect(screen.getByTestId("custom-header").tagName).toBe("HEADER");

      // Test RelatedGridDescription with asChild
      render(
        <RelatedGridDescription asChild>
          <span data-testid="custom-desc">Description</span>
        </RelatedGridDescription>
      );
      expect(screen.getByTestId("custom-desc").tagName).toBe("SPAN");

      // Test RelatedGridContent with asChild
      render(
        <RelatedGridContent asChild>
          <section data-testid="custom-content">Content</section>
        </RelatedGridContent>
      );
      expect(screen.getByTestId("custom-content").tagName).toBe("SECTION");

      // Test RelatedGridItem with asChild
      render(
        <RelatedGridItem asChild>
          <article data-testid="custom-item">Item</article>
        </RelatedGridItem>
      );
      expect(screen.getByTestId("custom-item").tagName).toBe("ARTICLE");

      // Test RelatedGridItemHeader with asChild
      render(
        <RelatedGridItemHeader asChild>
          <header data-testid="custom-item-header">Item Header</header>
        </RelatedGridItemHeader>
      );
      expect(screen.getByTestId("custom-item-header").tagName).toBe("HEADER");

      // Test RelatedGridItemTitle with asChild
      render(
        <RelatedGridItemTitle asChild>
          <h4 data-testid="custom-item-title">Item Title</h4>
        </RelatedGridItemTitle>
      );
      expect(screen.getByTestId("custom-item-title").tagName).toBe("H4");

      // Test RelatedGridItemDescription with asChild
      render(
        <RelatedGridItemDescription asChild>
          <span data-testid="custom-item-desc">Item Desc</span>
        </RelatedGridItemDescription>
      );
      expect(screen.getByTestId("custom-item-desc").tagName).toBe("SPAN");

      // Test RelatedGridItemContent with asChild
      render(
        <RelatedGridItemContent asChild>
          <main data-testid="custom-item-content">Item Content</main>
        </RelatedGridItemContent>
      );
      expect(screen.getByTestId("custom-item-content").tagName).toBe("MAIN");

      // Test RelatedGridItemFooter with asChild
      render(
        <RelatedGridItemFooter asChild>
          <footer data-testid="custom-item-footer">Item Footer</footer>
        </RelatedGridItemFooter>
      );
      expect(screen.getByTestId("custom-item-footer").tagName).toBe("FOOTER");
    });
  });
});
