import { useFormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React from "react";

/**
 * TranslatableFormMessage component
 *
 * A wrapper for FormMessage that handles translation of error messages.
 * It automatically translates common validation error messages using the next-intl translation system.
 *
 * @param props - React component props extending paragraph element properties
 * @param props.children - Fallback content to display if translation is not available
 * @returns Translated form error message or children as fallback
 */
export function TranslatableFormFieldMessage({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  const t = useTranslations("components.form.input");
  const { error, formMessageId } = useFormField();

  if (!error && !children) {
    return null;
  }

  const errorMessage = error ? String(error?.message ?? "") : undefined;
  const translatedMessage =
    typeof errorMessage === "string" && t.has(errorMessage as never)
      ? t(errorMessage as never)
      : errorMessage;

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {translatedMessage ?? children}
    </p>
  );
}
