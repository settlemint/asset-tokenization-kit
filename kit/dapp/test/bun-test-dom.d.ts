// Type declarations for bun:test with DOM testing matchers
declare module "bun:test" {
  interface Matchers<R = void> {
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeEmptyDOMElement(): R;
    toBeInTheDocument(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toBeVisible(): R;
    toContainElement(element: Element | null): R;
    toContainHTML(html: string): R;
    toHaveAccessibleDescription(expectedDescription?: string | RegExp): R;
    toHaveAccessibleErrorMessage(expectedErrorMessage?: string | RegExp): R;
    toHaveAccessibleName(expectedName?: string | RegExp): R;
    toHaveAttribute(attr: string, value?: string | RegExp | null): R;
    toHaveClass(...className: string[]): R;
    toHaveFocus(): R;
    toHaveFormValues(expectedValues: Record<string, unknown>): R;
    toHaveStyle(css: string | Record<string, unknown>): R;
    toHaveTextContent(
      text: string | RegExp,
      options?: { normalizeWhitespace: boolean }
    ): R;
    toHaveValue(value?: string | string[] | number | null): R;
    toHaveDisplayValue(value?: string | RegExp | Array<string | RegExp>): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toHaveRole(role: string, options?: Record<string, unknown>): R;
  }
}