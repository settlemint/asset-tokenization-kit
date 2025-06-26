import { describe, expect, it, mock } from "bun:test";
import { render } from "@testing-library/react";
import { Logo } from "./logo";

// Mock next-themes
void mock.module("next-themes", () => ({
  useTheme: mock(() => ({
    resolvedTheme: "light",
  })),
}));

// Mock next/image
void mock.module("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    ...props
  }: {
    src: string;
    alt: string;
    className?: string;
    [key: string]: unknown;
  }) => <img src={src} alt={alt} className={className} {...props} />,
}));

describe("Logo", () => {
  it("renders horizontal variant by default", () => {
    const { container } = render(<Logo />);

    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute(
      "src",
      "/SettleMint_Logo_Horizontal_black.svg"
    );
    expect(images[0]).toHaveAttribute("alt", "SettleMint");
  });

  it("renders horizontal variant with dark theme", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      resolvedTheme: "dark",
    });

    const { container } = render(<Logo variant="horizontal" />);

    const image = container.querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      "/SettleMint_Logo_Horizontal_white.svg"
    );
  });

  it("renders vertical variant", () => {
    const { container } = render(<Logo variant="vertical" />);

    const image = container.querySelector("img");
    expect(image).toHaveAttribute("src", "/SettleMint_Logo_Vertical_black.svg");
    expect(image).toHaveClass("h-20");
  });

  it("renders icon variant", () => {
    const { container } = render(<Logo variant="icon" />);

    const image = container.querySelector("img");
    expect(image).toHaveAttribute("src", "/SettleMint_Logo_Icon_black.svg");
    expect(image).toHaveClass("h-7", "w-7");
  });

  it("applies custom className", () => {
    const { container } = render(<Logo className="custom-logo-class" />);

    const image = container.querySelector("img");
    expect(image).toHaveClass("custom-logo-class");
  });

  it("uses forced color mode when provided", () => {
    const { container } = render(<Logo forcedColorMode="dark" />);

    const image = container.querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      "/SettleMint_Logo_Horizontal_white.svg"
    );
  });

  it("ignores theme when forced color mode is set", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      resolvedTheme: "dark",
    });

    const { container } = render(<Logo forcedColorMode="light" />);

    const image = container.querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      "/SettleMint_Logo_Horizontal_black.svg"
    );
  });

  it("applies correct dimensions for each variant", () => {
    // Horizontal
    const { container: horizontal } = render(<Logo variant="horizontal" />);
    const horizontalImg = horizontal.querySelector("img");
    expect(horizontalImg).toHaveClass("h-8");

    // Vertical
    const { container: vertical } = render(<Logo variant="vertical" />);
    const verticalImg = vertical.querySelector("img");
    expect(verticalImg).toHaveClass("h-20");

    // Icon
    const { container: icon } = render(<Logo variant="icon" />);
    const iconImg = icon.querySelector("img");
    expect(iconImg).toHaveClass("h-7", "w-7");
  });

  it("handles undefined theme gracefully", async () => {
    const { useTheme } = await import("next-themes");
    (useTheme as ReturnType<typeof mock>).mockReturnValue({
      resolvedTheme: undefined,
    });

    const { container } = render(<Logo />);

    const image = container.querySelector("img");
    // Should default to light theme
    expect(image).toHaveAttribute(
      "src",
      "/SettleMint_Logo_Horizontal_black.svg"
    );
  });

  it("maintains alt text across all variants", () => {
    const variants = ["horizontal", "vertical", "icon"] as const;

    variants.forEach((variant) => {
      const { container } = render(<Logo variant={variant} />);
      const image = container.querySelector("img");
      expect(image).toHaveAttribute("alt", "SettleMint");
    });
  });

  it("combines custom className with variant classes", () => {
    const { container } = render(
      <Logo variant="icon" className="custom-class" />
    );

    const image = container.querySelector("img");
    expect(image).toHaveClass("h-7", "w-7", "custom-class");
  });

  it("renders correct paths for all variant and theme combinations", async () => {
    const variants = ["horizontal", "vertical", "icon"] as const;
    const themes = ["light", "dark"] as const;
    const { useTheme } = await import("next-themes");

    variants.forEach((variant) => {
      themes.forEach((theme) => {
        (useTheme as ReturnType<typeof mock>).mockReturnValue({
          resolvedTheme: theme,
        });

        const { container } = render(<Logo variant={variant} />);
        const image = container.querySelector("img");

        const expectedColor = theme === "dark" ? "white" : "black";
        const expectedVariant =
          variant.charAt(0).toUpperCase() + variant.slice(1);
        const expectedSrc = `/SettleMint_Logo_${expectedVariant}_${expectedColor}.svg`;

        expect(image).toHaveAttribute("src", expectedSrc);
      });
    });
  });
});
