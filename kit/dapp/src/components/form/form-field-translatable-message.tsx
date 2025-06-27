import { useFormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type React from "react";

/**
 * TranslatableFormFieldMessage component
 *
 * A custom form message component that directly translates error messages.
 */
export function TranslatableFormFieldMessage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  const t = useTranslations();
  const { error, formMessageId } = useFormField();

  if (!error) {
    return null;
  }

  const errorMessage = String(error.message ?? "");
  const translatedMessage = t.has(errorMessage)
    ? t(errorMessage)
    : errorMessage;

  // We use a custom paragraph element instead of FormMessage because
  // the original FormMessage always prioritizes using the raw error.message
  // from the form context over any children, which prevents us from showing
  // the translated error message through normal props
  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {translatedMessage}
    </p>
  );
}
