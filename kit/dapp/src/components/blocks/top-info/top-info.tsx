import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { PropsWithChildren } from "react";

const topInfoVariants = cva("w-full", {
  variants: {
    variant: {
      default: "rounded-md px-4 mb-4 linear-gradient-related",
      warning:
        "bg-state-warning-background border-sm-state-warning text-sm-state-warning rounded-md px-4 mb-4",
      destructive:
        "bg-state-error-background border-sm-state-error text-sm-state-error rounded-md px-4 mb-4",
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
