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
  label: string;
  required?: boolean;
  className?: string;
}) {
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
  children: (inputProps: { className: string }) => React.ReactElement;
}) {
  return (
    <div className="relative">
      {children({
        className: cn("peer", startAddon && "ps-6", endAddon && "pe-12"),
      })}
      {startAddon && (
        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-sm peer-disabled:opacity-50">
          {startAddon}
        </span>
      )}
      {endAddon && (
        <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm peer-disabled:opacity-50">
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
