import {
  FormDescription,
  FormLabel,
  FormMessage,
} from "@/components/form/tanstack-form";
import { cn } from "@/lib/utils";
import type { AnyFieldMeta } from "@tanstack/react-form";
import React, { type ReactNode } from "react";

export function FieldLabel({
  htmlFor,
  label,
  required = false,
  className,
}: {
  htmlFor: string;
  label?: string;
  required?: boolean;
  className?: string;
}) {
  if (!label) return null;
  return (
    <FormLabel htmlFor={htmlFor} className={className}>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </FormLabel>
  );
}

export function FieldDescription({ description }: { description?: string }) {
  if (!description) return null;
  return <FormDescription>{description}</FormDescription>;
}

export function FieldErrors({ isTouched, errors }: AnyFieldMeta) {
  if (!isTouched) return null;
  if (errors.length === 0) return null;
  return (
    <FormMessage>
      {errors
        .map((err) => {
          const error = err as { message?: string };
          return error.message ?? String(err);
        })
        .join(", ")}
    </FormMessage>
  );
}

export function FieldLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-2 p-1">{children}</div>;
}

export function FieldPostfix({ postfix }: { postfix?: string }) {
  if (!postfix) return null;
  return <span className="text-sm text-muted-foreground">{postfix}</span>;
}

export function withPostfix<T extends object>(
  Component: React.ComponentType<T>,
  postfix?: string
) {
  const ComponentWithPostfix = (props: T) => (
    <div className="flex items-center gap-2">
      <Component {...props} />
      <FieldPostfix postfix={postfix} />
    </div>
  );
  return ComponentWithPostfix;
}

/**
 * Creates a unified input field with optional start and end addons that behaves as a single focusable unit.
 *
 * This component addresses a critical UX challenge: when input fields have visual addons (like currency symbols
 * or units), users expect the entire visual component to respond to focus as one cohesive element, not just the
 * input portion. Without this unified behavior, focus rings would only appear around the input, making the
 * addons feel disconnected and creating a jarring visual experience.
 *
 * ## Focus Ring Strategy
 *
 * We use CSS container queries (`has-[input:focus-visible]`) to detect when the nested input receives focus
 * and apply the focus ring to the parent container instead of the input itself. This creates a seamless
 * visual boundary that encompasses the entire field including all addons.
 *
 * ### Why CSS Container Queries Over JavaScript
 * - **Performance**: No event listeners or React re-renders needed for focus state
 * - **Accessibility**: Preserves native keyboard navigation without interference
 * - **Consistency**: Matches browser focus behavior expectations across all form fields
 * - **Maintainability**: Focus logic is declarative in CSS rather than scattered across components
 *
 * ## Visual Cohesion Implementation
 *
 * The input's default focus styles are disabled (`focus-visible:ring-0`) and replaced with:
 * - Container-level focus ring that encompasses all visual elements
 * - Coordinated border color changes on addons to match the focused input
 * - Smooth transitions that feel natural and responsive
 *
 * ## Border Overlap Strategy
 *
 * Adjacent elements (input + addons) have overlapping borders to prevent double-thickness borders
 * at connection points. The negative margins (`-ms-px`, `-me-px`, `-mx-px`) ensure seamless
 * visual connections while maintaining individual element styling control.
 *
 * @param startAddon - Text displayed before the input (e.g., "$", "https://")
 * @param endAddon - Text displayed after the input (e.g., "%", ".com")
 * @param children - Render function that receives className overrides for the input element
 *
 * @example
 * ```tsx
 * <FieldWithAddons startAddon="$" endAddon="USD">
 *   {({ className }) => (
 *     <Input
 *       type="number"
 *       className={className}
 *       value={amount}
 *       onChange={handleChange}
 *     />
 *   )}
 * </FieldWithAddons>
 * ```
 *
 * ## Integration Points
 *
 * This component is designed to work seamlessly with:
 * - `TextField`, `NumberField`, `BigintField`, `DnumField` - All form field components use this for addon support
 * - `Input` component - Automatically has its focus styles overridden when used within this wrapper
 * - `errorClassNames` utility - Error states still work correctly with the unified focus behavior
 * - TanStack Form - Field validation and state management remain unaffected
 */
export function FieldWithAddons({
  startAddon,
  endAddon,
  children,
}: {
  startAddon?: string;
  endAddon?: string;
  children: (inputProps: { className?: string }) => React.ReactElement;
}) {
  return (
    // Container that detects child input focus and applies unified focus ring
    // Uses CSS container queries to avoid JavaScript focus management complexity
    <div className="group flex rounded-md shadow-xs has-[input:focus-visible]:ring-ring/50 has-[input:focus-visible]:ring-[3px] transition-[box-shadow]">
      {startAddon && (
        // Start addon that visually connects to input with responsive border colors
        // Border changes to match focus ring when input is focused via CSS container query
        <span className="border-input bg-background text-muted-foreground inline-flex items-center rounded-s-md border px-3 text-sm group-has-[input:focus-visible]:border-ring transition-colors">
          {startAddon}
        </span>
      )}
      {children({
        className: cn(
          // Disable input's native focus ring since container handles it
          // This prevents double focus rings and ensures unified visual behavior
          "shadow-none focus-visible:ring-0 focus-visible:border-ring",
          // Border overlap prevention: negative margins ensure seamless visual connections
          // Each combination handles different addon scenarios to prevent double-thickness borders
          startAddon && !endAddon && "-ms-px rounded-s-none", // Connected to start addon only
          !startAddon && endAddon && "-me-px rounded-e-none", // Connected to end addon only
          startAddon && endAddon && "-mx-px rounded-none" // Connected to both addons
        ),
      })}
      {endAddon && (
        // End addon that mirrors start addon behavior for visual consistency
        <span className="border-input bg-background text-muted-foreground inline-flex items-center rounded-e-md border px-3 text-sm group-has-[input:focus-visible]:border-ring transition-colors">
          {endAddon}
        </span>
      )}
    </div>
  );
}

export function errorClassNames({
  isTouched,
  isValid,
}: {
  isTouched?: boolean;
  isValid: boolean;
}) {
  return cn(isTouched && !isValid && "border-destructive");
}
