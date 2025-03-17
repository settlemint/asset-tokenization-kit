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
      default: "linear-gradient-related mb-4 rounded-md px-4",
      warning:
        "mb-4 rounded-md border-sm-state-warning bg-state-warning-background px-4 text-sm-state-warning",
      destructive:
        "mb-4 rounded-md border-sm-state-error bg-state-error-background px-4 text-sm-state-error",
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
            {variant === "default" && <Info className="size-4" />}
            {variant === "warning" && <AlertTriangle className="size-4" />}
            {variant === "destructive" && <AlertCircle className="size-4" />}
            {title}
          </div>
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
