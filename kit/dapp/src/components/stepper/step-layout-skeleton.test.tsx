import { renderWithProviders } from "@test/helpers/test-utils";
import { describe, expect, it } from "vitest";
import { StepLayoutSkeleton } from "./step-layout-skeleton";

describe("StepLayoutSkeleton", () => {
  describe("Basic Rendering", () => {
    it("should render skeleton layout with default structure", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      // Should have main StepLayout container
      const stepLayoutContainer = container.querySelector(".StepLayout");
      expect(stepLayoutContainer).toBeInTheDocument();
      expect(stepLayoutContainer).toHaveClass(
        "h-full",
        "shadow-lg",
        "overflow-hidden",
        "flex"
      );
    });

    it("should render with sidebar structure", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      // Should have sidebar
      const sidebar = container.querySelector('[data-sidebar="sidebar"]');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass("w-[360px]", "flex-shrink-0");
    });

    it("should render with main content area", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      // Should have main content area
      const mainContent = container.querySelector(".StepLayout__main");
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveClass(
        "flex-1",
        "flex",
        "flex-col",
        "transition-all",
        "duration-300",
        "relative"
      );
    });
  });

  describe("Sidebar Content", () => {
    it("should render title skeleton in sidebar header", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const titleSkeleton = container.querySelector(
        '[data-sidebar="header"] .h-8.w-48'
      );
      expect(titleSkeleton).toBeInTheDocument();
      expect(titleSkeleton).toHaveAttribute("data-slot", "skeleton");
    });

    it("should render description skeleton in sidebar header", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const descSkeleton = container.querySelector(
        '[data-sidebar="header"] .h-4.w-64'
      );
      expect(descSkeleton).toBeInTheDocument();
      expect(descSkeleton).toHaveAttribute("data-slot", "skeleton");
    });

    it("should render progress skeletons in sidebar header", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      // Progress text skeletons
      const progressSkeletons = container.querySelectorAll(
        '[data-sidebar="header"] .h-3'
      );
      expect(progressSkeletons).toHaveLength(2); // Step text and count

      // Progress bar skeleton
      const progressBar = container.querySelector(
        '[data-sidebar="header"] .h-2.w-full'
      );
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe("Step Groups", () => {
    it("should render default number of step groups (3)", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const stepGroups = container.querySelectorAll(
        '[data-sidebar="content"] .space-y-4 > [data-slot="skeleton"]'
      );
      expect(stepGroups).toHaveLength(3);
    });

    it("should render custom number of step groups", () => {
      const { container } = renderWithProviders(
        <StepLayoutSkeleton groupCount={5} />
      );

      const stepGroups = container.querySelectorAll(
        '[data-sidebar="content"] .space-y-4 > [data-slot="skeleton"]'
      );
      expect(stepGroups).toHaveLength(5);
    });

    it("should render step group skeletons with correct styles", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const stepGroups = container.querySelectorAll(
        '[data-sidebar="content"] .space-y-4 > [data-slot="skeleton"]'
      );

      stepGroups.forEach((group) => {
        expect(group).toHaveClass(
          "my-6",
          "h-12",
          "bg-accent-foreground/20",
          "rounded-md"
        );
      });
    });

    it("should handle zero step groups", () => {
      const { container } = renderWithProviders(
        <StepLayoutSkeleton groupCount={0} />
      );

      const stepGroups = container.querySelectorAll(
        '[data-sidebar="content"] .space-y-4 > [data-slot="skeleton"]'
      );
      expect(stepGroups).toHaveLength(0);
    });
  });

  describe("Main Content Area", () => {
    it("should render main content title skeleton", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const titleSkeleton = container.querySelector(
        ".StepLayout__main .h-8.w-2/3"
      );
      expect(titleSkeleton).toBeInTheDocument();
      expect(titleSkeleton).toHaveAttribute("data-slot", "skeleton");
    });

    it("should render main content description skeleton", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const descSkeleton = container.querySelector(
        ".StepLayout__main .h-4.w-4/5"
      );
      expect(descSkeleton).toBeInTheDocument();
      expect(descSkeleton).toHaveAttribute("data-slot", "skeleton");
    });

    it("should apply correct background styling to main content", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const mainContent = container.querySelector(".StepLayout__main");
      expect(mainContent).toHaveStyle({
        backgroundColor: "var(--sm-background-lightest)",
      });
    });
  });

  describe("Custom Props", () => {
    it("should apply custom className", () => {
      const { container } = renderWithProviders(
        <StepLayoutSkeleton className="custom-test-class" />
      );

      const stepLayoutContainer = container.querySelector(".StepLayout");
      expect(stepLayoutContainer).toHaveClass("custom-test-class");
    });

    it("should merge custom className with default classes", () => {
      const { container } = renderWithProviders(
        <StepLayoutSkeleton className="rounded-xl" />
      );

      const stepLayoutContainer = container.querySelector(".StepLayout");
      expect(stepLayoutContainer).toHaveClass(
        "h-full",
        "shadow-lg",
        "overflow-hidden",
        "flex",
        "rounded-xl"
      );
    });
  });

  describe("Styling and Colors", () => {
    it("should use accent-foreground colors in sidebar", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const sidebarSkeletons = container.querySelectorAll(
        '[data-sidebar] [data-slot="skeleton"]'
      );

      sidebarSkeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass("bg-accent-foreground/20");
      });
    });

    it("should use responsive colors in main content", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const mainSkeletons = container.querySelectorAll(
        ".StepLayout__main [data-slot='skeleton']"
      );

      mainSkeletons.forEach((skeleton) => {
        expect(skeleton.classList.toString()).toMatch(
          /bg-current\/10|dark:bg-accent-foreground\/20/
        );
      });
    });

    it("should apply gradient background to sidebar", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const sidebarBackground = container.querySelector(
        '[data-sidebar="sidebar"] .w-full.overflow-y-auto.h-full'
      );
      expect(sidebarBackground).toHaveStyle({
        background: "var(--sm-wizard-sidebar-gradient)",
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
      });
    });
  });

  describe("Animation and Accessibility", () => {
    it("should have animate-pulse class on all skeleton elements", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass("animate-pulse");
      });
    });

    it("should maintain proper focus management structure", () => {
      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      // Sidebar should be focusable container
      const sidebar = container.querySelector('[data-sidebar="sidebar"]');
      expect(sidebar).toBeInTheDocument();

      // Main content should be scrollable
      const scrollableContent = container.querySelector(
        ".StepLayout__main .overflow-y-auto"
      );
      expect(scrollableContent).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should maintain structure on different screen sizes", () => {
      // Simulate smaller viewport
      Object.defineProperty(globalThis, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { container } = renderWithProviders(<StepLayoutSkeleton />);

      const stepLayout = container.querySelector(".StepLayout");
      expect(stepLayout).toHaveClass("flex");

      const sidebar = container.querySelector('[data-sidebar="sidebar"]');
      expect(sidebar).toHaveClass("w-[360px]");
    });
  });

  describe("Error Boundaries", () => {
    it("should handle invalid groupCount gracefully", () => {
      const { container } = renderWithProviders(
        <StepLayoutSkeleton groupCount={-1} />
      );

      // Should still render the basic structure
      const stepLayout = container.querySelector(".StepLayout");
      expect(stepLayout).toBeInTheDocument();

      // Should have no groups for negative count
      const stepGroups = container.querySelectorAll(
        '[data-sidebar="content"] .space-y-4 > [data-slot="skeleton"]'
      );
      expect(stepGroups).toHaveLength(0);
    });

    it("should handle very large groupCount", () => {
      const { container } = renderWithProviders(
        <StepLayoutSkeleton groupCount={100} />
      );

      const stepGroups = container.querySelectorAll(
        '[data-sidebar="content"] .space-y-4 > [data-slot="skeleton"]'
      );
      expect(stepGroups).toHaveLength(100);
    });
  });
});
