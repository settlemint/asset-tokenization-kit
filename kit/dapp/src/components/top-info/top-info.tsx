import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { PropsWithChildren } from "react";

const topInfoVariants = cva("w-full", {
  variants: {
    variant: {
      default: "mb-8 rounded-md px-4 linear-gradient-related",
      warning:
        "mb-8 rounded-md border-sm-state-warning bg-state-warning-background px-4 text-sm-state-warning",
      destructive:
        "mb-8 rounded-md border-sm-state-error bg-state-error-background px-4 text-sm-state-error",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface TopInfoProps
  extends PropsWithChildren,
    VariantProps<typeof topInfoVariants> {
  title: string;
}

/**
 * TopInfo component - Collapsible information panel
 *
 * @example
 * ```tsx
 * <TopInfo title="Important Information">
 *   <p>This is some important information about the current page.</p>
 * </TopInfo>
 *
 * <TopInfo title="Warning" variant="warning">
 *   <p>This action cannot be undone.</p>
 * </TopInfo>
 * ```
 */
export function TopInfo({
  title,
  children,
  variant = "default",
}: TopInfoProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn(topInfoVariants({ variant }))}
    >
      <AccordionItem value="info">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            {variant === "default" && (
              <Info className="size-4" aria-hidden="true" />
            )}
            {variant === "warning" && (
              <AlertTriangle className="size-4" aria-hidden="true" />
            )}
            {variant === "destructive" && (
              <AlertCircle className="size-4" aria-hidden="true" />
            )}
            {title}
          </div>
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
