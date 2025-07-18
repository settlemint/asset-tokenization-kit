import { Label } from "@/components/ui/label";
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
    <Label htmlFor={htmlFor} className={className}>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
}

export function FieldDescription({ description }: { description?: string }) {
  if (!description) return null;
  return <p className="text-sm text-muted-foreground">{description}</p>;
}

export function FieldErrors({ isTouched, errors }: AnyFieldMeta) {
  if (!isTouched) return null;
  if (errors.length === 0) return null;
  return (
    <p className="text-sm text-destructive">
      {errors.map((err) => err.message).join(", ")}
    </p>
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

export function errorClassNames({
  isTouched,
  errors,
}: {
  isTouched?: boolean;
  errors: string[];
}) {
  return cn(isTouched && errors.length > 0 && "border-destructive");
}
