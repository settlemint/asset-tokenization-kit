"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { mergeRefs } from "@/lib/merge-refs";
import type {
  AccordionMultipleProps,
  AccordionSingleProps,
} from "@radix-ui/react-accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, ChevronRight, Link as LinkIcon } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

export const Accordions = forwardRef<
  HTMLDivElement,
  | Omit<AccordionSingleProps, "value" | "onValueChange">
  | Omit<AccordionMultipleProps, "value" | "onValueChange">
>(({ type = "single", className, defaultValue, ...props }, ref) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const composedRef = mergeRefs(ref, rootRef);
  const [value, setValue] = useState<string | string[]>(() =>
    type === "single" ? (defaultValue ?? "") : (defaultValue ?? [])
  );

  useEffect(() => {
    const id = globalThis.location.hash.slice(1);
    const element = rootRef.current;
    if (!element || id.length === 0) return;

    const selected = document.querySelector(`#${id}`);
    if (!selected || !element.contains(selected)) return;
    const value =
      selected instanceof HTMLElement
        ? selected.dataset.accordionValue
        : undefined;

    if (value)
      setValue((prev) => (typeof prev === "string" ? value : [value, ...prev]));
  }, []);

  return (
    // @ts-expect-error -- Multiple types
    <AccordionPrimitive.Root
      type={type}
      ref={composedRef}
      value={value}
      onValueChange={setValue}
      collapsible={type === "single" ? true : undefined}
      className={cn(
        "divide-y divide-fd-border overflow-hidden rounded-lg border bg-fd-card",
        className
      )}
      {...props}
    />
  );
});

Accordions.displayName = "Accordions";

export const Accordion = forwardRef<
  HTMLDivElement,
  Omit<
    ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>,
    "value" | "title"
  > & {
    title: string | ReactNode;
    value?: string;
  }
>(
  (
    {
      title,
      className,
      id,
      value = typeof title === "string" ? title : "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <AccordionPrimitive.Item
        ref={ref}
        value={value}
        className={cn("scroll-m-24", className)}
        {...props}
      >
        <AccordionPrimitive.Header
          id={id}
          data-accordion-value={value}
          className="not-prose flex flex-row items-center text-fd-card-foreground font-medium has-focus-visible:bg-fd-accent"
        >
          <AccordionPrimitive.Trigger className="group flex flex-1 items-center gap-2 px-3 py-2.5 text-start focus-visible:outline-none">
            <ChevronRight className="size-4 shrink-0 text-fd-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
            {title}
          </AccordionPrimitive.Trigger>
          {id ? <CopyButton id={id} /> : null}
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-fd-accordion-up data-[state=open]:animate-fd-accordion-down">
          <div className="px-4 pb-2 text-[15px] prose-no-margin">
            {children}
          </div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    );
  }
);

function CopyButton({ id }: { id: string }) {
  const [checked, onClick] = useCopyButton(() => {
    const url = new URL(globalThis.location.href);
    url.hash = id;

    return navigator.clipboard.writeText(url.toString());
  });

  return (
    <button
      type="button"
      aria-label="Copy Link"
      className={cn(
        buttonVariants({
          variant: "ghost",
          className: "text-fd-muted-foreground me-2",
        })
      )}
      onClick={onClick}
    >
      {checked ? (
        <Check className="size-3.5" />
      ) : (
        <LinkIcon className="size-3.5" />
      )}
    </button>
  );
}

Accordion.displayName = "Accordion";
