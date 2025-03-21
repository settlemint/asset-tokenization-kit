import { useFormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { getZodErrorParams } from "@/lib/utils/zod-translations";
import { useTranslations } from "next-intl";
import type React from "react";
import { z } from "zod";

/**
 * TranslatableFormMessage component
 *
 * A wrapper for FormMessage that handles translation of error messages.
 * It automatically translates Zod validation errors using the next-intl translation system,
 * including proper handling of dynamic parameters like minimum/maximum values.
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
  const t = useTranslations("zod.error");
  const { error, formMessageId } = useFormField();

  if (!error && !children) {
    return null;
  }

  // Extract the error message string
  const errorMessage = error ? String(error?.message ?? "") : undefined;

  let translatedMessage = errorMessage;

  // Check if this is a Zod error (typically they start with "zod.error.")
  try {
    // Parse parameters if this is a Zod error
    let params = {};

    // Access zodIssue using type assertion and optional chaining for safety
    const customError = error as { zodIssue?: z.ZodIssue };
    if (customError?.zodIssue) {
      params = getZodErrorParams(customError.zodIssue);
    }

    // Translate with the Zod translator and parameters
    translatedMessage = t(errorMessage as any, params as any);
  } catch (e) {
    console.error("Error translating Zod error:", e);
    // Fall back to direct translation without parameters
    translatedMessage = t.has(errorMessage as any)
      ? t(errorMessage as any)
      : errorMessage;
  }

  return (
    <div
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {translatedMessage ?? children}
    </div>
  );
}
