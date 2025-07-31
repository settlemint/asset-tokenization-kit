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
  return <div className="space-y-2">{children}</div>;
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
    <div className="flex rounded-md shadow-xs">
      {startAddon && (
        <span className="border-input bg-background text-muted-foreground inline-flex items-center rounded-s-md border px-3 text-sm">
          {startAddon}
        </span>
      )}
      {children({
        className: cn(
          "shadow-none",
          startAddon && !endAddon && "-ms-px rounded-s-none",
          !startAddon && endAddon && "-me-px rounded-e-none",
          startAddon && endAddon && "-mx-px rounded-none"
        ),
      })}
      {endAddon && (
        <span className="border-input bg-background text-muted-foreground inline-flex items-center rounded-e-md border px-3 text-sm">
          {endAddon}
        </span>
      )}
    </div>
  );
}

export function errorClassNames({
  isTouched,
  errors,
}: {
  isTouched?: boolean;
  errors: string[];
}) {
  return cn(isTouched && errors.length > 0 && "border-destructive");
}
