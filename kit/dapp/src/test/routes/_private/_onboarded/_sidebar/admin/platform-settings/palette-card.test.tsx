import { PaletteCard } from "@/components/theme/components/palette-card";
import {
  DEFAULT_THEME,
  type ThemeConfig,
  type ThemeToken,
} from "@/components/theme/lib/schema";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { type ReactNode, useMemo, useState } from "react";
import { describe, expect, it } from "vitest";

type ErrorMap = Record<string, string | undefined>;

type MockFieldProps = {
  name: string;
  children: (field: {
    state: { value: unknown; meta: { errors: string[] } };
    handleChange: (value: string) => void;
  }) => ReactNode;
};

function createMockForm(baseTheme: ThemeConfig, errors: ErrorMap = {}) {
  function MockField({ name, children }: MockFieldProps) {
    const initial = useMemo(() => {
      return getValueByPath(baseTheme, name) ?? "";
    }, [name]);
    const [value, setValue] = useState<string>(
      typeof initial === "string" ? initial : ""
    );

    const handleChange = (next: string) => {
      setValue(next);
    };

    return (
      <>
        {children({
          state: {
            value,
            meta: {
              errors: errors[name] ? [errors[name]] : [],
            },
          },
          handleChange,
        })}
      </>
    );
  }

  return {
    Field: MockField,
  } as unknown;
}

function getValueByPath(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in acc) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

const TRANSLATIONS: Record<string, string> = {
  editColor: "Edit {{token}} color",
  revertButton: "Revert",
};

const translate = (
  key: string,
  fallbackOrOptions?: string | Record<string, unknown>,
  maybeOptions?: Record<string, unknown>
) => {
  const fallback =
    typeof fallbackOrOptions === "string" ? fallbackOrOptions : undefined;
  const options =
    typeof fallbackOrOptions === "object" && fallbackOrOptions !== null
      ? fallbackOrOptions
      : maybeOptions;

  const templateCandidate = TRANSLATIONS[key] ?? fallback ?? key;
  const template =
    typeof templateCandidate === "string"
      ? templateCandidate
      : String(templateCandidate ?? "");

  return template.replaceAll(/\{\{(\w+)\}\}/g, (_match, token) => {
    const replacement = options?.[token];
    return typeof replacement === "string" ? replacement : "";
  });
};

describe("PaletteCard", () => {
  const baseTheme = DEFAULT_THEME;
  const token: ThemeToken = "sm-accent";
  const defaultTokenValue = baseTheme.cssVars.light[token];
  const tokens = [token] as const;

  const renderPalette = (form: unknown) => {
    render(
      <PaletteCard
        sectionId="light"
        form={form as never}
        baseTheme={baseTheme}
        mode="light"
        tokens={[...tokens]}
        t={translate as never}
      />
    );
  };

  it("updates preview swatch when the token value changes", () => {
    const form = createMockForm(baseTheme);
    renderPalette(form);

    const tokenCell = screen.getByRole("cell", { name: token });
    const row = tokenCell.closest("tr");
    expect(row).not.toBeNull();
    const input = within(row!).getByRole("textbox");
    const swatch = within(row!).getByRole("button", {
      name: `Edit ${token} color`,
    });

    expect(swatch).toHaveStyle({ background: defaultTokenValue });

    const nextValue = "oklch(0.55 0.1 100)";
    fireEvent.change(input, { target: { value: nextValue } });

    expect(swatch).toHaveStyle({ background: nextValue });
  });

  it("reverts token value to the base theme", () => {
    const form = createMockForm(baseTheme);
    renderPalette(form);

    const tokenCell = screen.getByRole("cell", { name: token });
    const row = tokenCell.closest("tr");
    const input = within(row!).getByRole("textbox");
    const swatch = within(row!).getByRole("button", {
      name: `Edit ${token} color`,
    });
    const revertButton = within(row!).getByRole("button", { name: "Revert" });

    const nextValue = "oklch(0.40 0.2 80)";
    fireEvent.change(input, { target: { value: nextValue } });
    expect(swatch).toHaveStyle({ background: nextValue });

    fireEvent.click(revertButton);

    expect(swatch).toHaveStyle({ background: defaultTokenValue });
  });

  it("renders validation errors from the form field state", () => {
    const errorMessage = "Invalid color value";
    const form = createMockForm(baseTheme, {
      [`cssVars.light.${token}`]: errorMessage,
    });

    renderPalette(form);

    const tokenCell = screen.getByRole("cell", { name: token });
    const row = tokenCell.closest("tr");
    expect(within(row!).getByRole("alert")).toHaveTextContent(errorMessage);
  });
});
