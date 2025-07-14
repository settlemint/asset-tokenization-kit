import { Label } from "@/components/ui/label";
import React, { type ReactNode } from "react";

export function FieldLabel({
  htmlFor,
  label,
  required = false,
}: {
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <Label htmlFor={htmlFor}>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
}

export function FieldDescription({ description }: { description?: string }) {
  if (!description) return null;
  return <p className="text-sm text-muted-foreground">{description}</p>;
}

export function FieldErrors({
  isTouched,
  errors,
}: {
  isTouched?: boolean;
  errors: string[];
}) {
  if (!isTouched) return null;
  if (errors.length === 0) return null;
  return <p className="text-sm text-destructive">{errors.join(", ")}</p>;
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
