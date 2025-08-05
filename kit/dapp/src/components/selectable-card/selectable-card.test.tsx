import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  SelectableCard,
  SelectableCardIcon,
  SelectableCardContent,
  SelectableCardTitle,
  SelectableCardDescription,
  selectableCardVariants,
} from "./selectable-card";

describe("SelectableCard", () => {
  describe("Component Structure", () => {
    it("should render with default props", () => {
      render(<SelectableCard>Content</SelectableCard>);
      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        "cursor-pointer",
        "select-none",
        "rounded-lg",
        "border"
      );
    });

    it("should render all sub-components correctly", () => {
      render(
        <SelectableCard>
          <SelectableCardIcon>
            <span>Icon</span>
          </SelectableCardIcon>
          <SelectableCardContent>
            <SelectableCardTitle>Title</SelectableCardTitle>
            <SelectableCardDescription>Description</SelectableCardDescription>
          </SelectableCardContent>
        </SelectableCard>
      );

      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });

    it("should apply data-slot attributes to all components", () => {
      const { container } = render(
        <SelectableCard>
          <SelectableCardIcon>Icon</SelectableCardIcon>
          <SelectableCardContent>
            <SelectableCardTitle>Title</SelectableCardTitle>
            <SelectableCardDescription>Description</SelectableCardDescription>
          </SelectableCardContent>
        </SelectableCard>
      );

      expect(
        container.querySelector('[data-slot="selectable-card"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-slot="selectable-card-icon"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-slot="selectable-card-content"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-slot="selectable-card-title"]')
      ).toBeInTheDocument();
      expect(
        container.querySelector('[data-slot="selectable-card-description"]')
      ).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it.each(["default", "ghost", "outline"] as const)(
      "should render %s variant correctly",
      (variant) => {
        render(<SelectableCard variant={variant}>Content</SelectableCard>);
        const card = screen
          .getByText("Content")
          .closest('[data-slot="selectable-card"]');
        expect(card).toBeInTheDocument();
      }
    );

    it("should apply selected variant when selected=true", () => {
      render(<SelectableCard selected>Content</SelectableCard>);
      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]');
      expect(card).toHaveClass(
        "border-primary",
        "bg-primary/5",
        "text-primary"
      );
    });

    it("should override variant with selected when selected=true", () => {
      render(
        <SelectableCard variant="ghost" selected>
          Content
        </SelectableCard>
      );
      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]');
      expect(card).toHaveClass(
        "border-primary",
        "bg-primary/5",
        "text-primary"
      );
    });
  });

  describe("Sizes", () => {
    it.each(["sm", "md", "lg"] as const)(
      "should apply %s size correctly",
      (size) => {
        render(<SelectableCard size={size}>Content</SelectableCard>);
        const card = screen
          .getByText("Content")
          .closest('[data-slot="selectable-card"]');
        const sizeClass = size === "sm" ? "p-3" : size === "md" ? "p-4" : "p-6";
        expect(card).toHaveClass(sizeClass);
      }
    );

    it("should apply default size (md) when not specified", () => {
      render(<SelectableCard>Content</SelectableCard>);
      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]');
      expect(card).toHaveClass("p-4");
    });
  });

  describe("Interactive States", () => {
    it("should apply interactive styles by default", () => {
      render(<SelectableCard>Content</SelectableCard>);
      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]');
      expect(card).toHaveClass("hover:scale-[1.02]", "active:scale-[0.98]");
    });

    it("should not apply interactive styles when interactive=false", () => {
      render(<SelectableCard interactive={false}>Content</SelectableCard>);
      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]');
      expect(card).not.toHaveClass("hover:scale-[1.02]", "active:scale-[0.98]");
    });

    it("should handle onClick events", () => {
      const handleClick = vi.fn();
      render(<SelectableCard onClick={handleClick}>Content</SelectableCard>);
      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]') as HTMLElement;
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("asChild prop", () => {
    it("should render as a button when asChild is true with button child", () => {
      render(
        <SelectableCard asChild>
          <button type="button">Button Content</button>
        </SelectableCard>
      );
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("data-slot", "selectable-card");
    });

    it("should work with asChild on sub-components", () => {
      render(
        <SelectableCard>
          <SelectableCardTitle asChild>
            <h3>Custom Heading</h3>
          </SelectableCardTitle>
        </SelectableCard>
      );
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute("data-slot", "selectable-card-title");
    });
  });

  describe("Backward Compatibility", () => {
    it("should work exactly like the original implementation", () => {
      const handleClick = vi.fn();
      render(
        <SelectableCard selected onClick={handleClick}>
          <SelectableCardIcon>
            <span>Icon</span>
          </SelectableCardIcon>
          <SelectableCardContent>
            <SelectableCardTitle>Title</SelectableCardTitle>
            <SelectableCardDescription>Description</SelectableCardDescription>
          </SelectableCardContent>
        </SelectableCard>
      );

      const card = screen
        .getByText("Title")
        .closest('[data-slot="selectable-card"]') as HTMLElement;
      expect(card).toHaveClass(
        "border-primary",
        "bg-primary/5",
        "text-primary"
      );
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Custom Classes", () => {
    it("should apply custom className to SelectableCard", () => {
      render(<SelectableCard className="custom-class">Content</SelectableCard>);
      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]');
      expect(card).toHaveClass("custom-class");
    });

    it("should apply custom className to sub-components", () => {
      const { container } = render(
        <SelectableCard>
          <SelectableCardIcon className="icon-custom">Icon</SelectableCardIcon>
          <SelectableCardContent className="content-custom">
            <SelectableCardTitle className="title-custom">
              Title
            </SelectableCardTitle>
            <SelectableCardDescription className="desc-custom">
              Description
            </SelectableCardDescription>
          </SelectableCardContent>
        </SelectableCard>
      );

      expect(
        container.querySelector('[data-slot="selectable-card-icon"]')
      ).toHaveClass("icon-custom");
      expect(
        container.querySelector('[data-slot="selectable-card-content"]')
      ).toHaveClass("content-custom");
      expect(
        container.querySelector('[data-slot="selectable-card-title"]')
      ).toHaveClass("title-custom");
      expect(
        container.querySelector('[data-slot="selectable-card-description"]')
      ).toHaveClass("desc-custom");
    });
  });

  describe("Props Spreading", () => {
    it("should spread additional props to SelectableCard", () => {
      render(
        <SelectableCard data-testid="test-card" aria-label="Test Card">
          Content
        </SelectableCard>
      );
      const card = screen.getByTestId("test-card");
      expect(card).toHaveAttribute("aria-label", "Test Card");
    });

    it("should spread additional props to sub-components", () => {
      render(
        <SelectableCard>
          <SelectableCardIcon data-testid="test-icon">Icon</SelectableCardIcon>
          <SelectableCardContent data-testid="test-content">
            <SelectableCardTitle data-testid="test-title">
              Title
            </SelectableCardTitle>
            <SelectableCardDescription data-testid="test-desc">
              Description
            </SelectableCardDescription>
          </SelectableCardContent>
        </SelectableCard>
      );

      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
      expect(screen.getByTestId("test-content")).toBeInTheDocument();
      expect(screen.getByTestId("test-title")).toBeInTheDocument();
      expect(screen.getByTestId("test-desc")).toBeInTheDocument();
    });
  });

  describe("CVA Variants", () => {
    it("should export selectableCardVariants", () => {
      expect(selectableCardVariants).toBeDefined();
      expect(typeof selectableCardVariants).toBe("function");
    });

    it("should generate correct classes with selectableCardVariants", () => {
      const defaultClasses = selectableCardVariants();
      expect(defaultClasses).toContain("flex");
      expect(defaultClasses).toContain("cursor-pointer");

      const selectedClasses = selectableCardVariants({ variant: "selected" });
      expect(selectedClasses).toContain("border-primary");

      const largeClasses = selectableCardVariants({ size: "lg" });
      expect(largeClasses).toContain("p-6");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      render(<SelectableCard />);
      const card = document.querySelector('[data-slot="selectable-card"]');
      expect(card).toBeInTheDocument();
    });

    it("should handle null/undefined in sub-components", () => {
      render(
        <SelectableCard>
          <SelectableCardIcon>{null}</SelectableCardIcon>
          <SelectableCardContent>
            <SelectableCardTitle>{undefined}</SelectableCardTitle>
            <SelectableCardDescription>{null}</SelectableCardDescription>
          </SelectableCardContent>
        </SelectableCard>
      );

      const card = document.querySelector('[data-slot="selectable-card"]');
      expect(card).toBeInTheDocument();
    });

    it("should handle multiple onClick handlers without conflicts", () => {
      const cardClick = vi.fn();
      const divClick = vi.fn();

      render(
        <div onClick={divClick}>
          <SelectableCard onClick={cardClick}>Content</SelectableCard>
        </div>
      );

      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]') as HTMLElement;
      fireEvent.click(card);

      expect(cardClick).toHaveBeenCalledTimes(1);
      expect(divClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("TypeScript Types", () => {
    it("should accept all valid props for HTML div element", () => {
      render(
        <SelectableCard
          id="test-id"
          role="button"
          tabIndex={0}
          aria-pressed="true"
        >
          Content
        </SelectableCard>
      );

      const card = screen
        .getByText("Content")
        .closest('[data-slot="selectable-card"]');
      expect(card).toHaveAttribute("id", "test-id");
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveAttribute("tabIndex", "0");
      expect(card).toHaveAttribute("aria-pressed", "true");
    });
  });
});
