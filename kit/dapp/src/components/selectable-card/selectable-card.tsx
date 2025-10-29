import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

/* -------------------------------------------------------------------------- */
/*                           SelectableCard Container                         */
/* -------------------------------------------------------------------------- */

const selectableCardVariants = cva(
  "flex cursor-pointer select-none rounded-lg border transition-all h-full",
  {
    variants: {
      variant: {
        default:
          "border-input bg-background hover:bg-accent/10 hover:text-accent-foreground",
        selected: "border-primary bg-primary/5 text-primary",
        ghost:
          "border-transparent hover:bg-accent/10 hover:text-accent-foreground",
        outline: "border-2 bg-transparent hover:bg-accent/10",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
      interactive: {
        true: "hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: true,
    },
  }
);

interface SelectableCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof selectableCardVariants> {
  asChild?: boolean;
  selected?: boolean;
}

function SelectableCard({
  className,
  variant = "default",
  size,
  interactive,
  selected = false,
  onClick,
  asChild = false,
  children,
  ...props
}: SelectableCardProps) {
  const Comp = asChild ? Slot : "div";
  const effectiveVariant = selected ? "selected" : variant;

  const componentProps = {
    "data-slot": "selectable-card",
    onClick,
    className: cn(
      selectableCardVariants({
        variant: effectiveVariant,
        size,
        interactive,
      }),
      className
    ),
    ...props,
  };

  if (asChild) {
    return <Comp {...componentProps}>{children}</Comp>;
  }

  return (
    <Comp {...componentProps}>
      <div className="flex items-start space-x-3 h-full">{children}</div>
    </Comp>
  );
}

/* -------------------------------------------------------------------------- */
/*                            SelectableCard Icon                             */
/* -------------------------------------------------------------------------- */

interface SelectableCardIconProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function SelectableCardIcon({
  className,
  asChild = false,
  children,
  ...props
}: SelectableCardIconProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="selectable-card-icon"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div className="w-4 h-4">{children}</div>
    </Comp>
  );
}

/* -------------------------------------------------------------------------- */
/*                          SelectableCard Content                            */
/* -------------------------------------------------------------------------- */

interface SelectableCardContentProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function SelectableCardContent({
  className,
  asChild = false,
  ...props
}: SelectableCardContentProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="selectable-card-content"
      className={cn("min-w-0 flex-1 flex flex-col", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                           SelectableCard Title                             */
/* -------------------------------------------------------------------------- */

interface SelectableCardTitleProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function SelectableCardTitle({
  className,
  asChild = false,
  ...props
}: SelectableCardTitleProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="selectable-card-title"
      className={cn("text-sm font-medium leading-6 mb-1", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                        SelectableCard Description                          */
/* -------------------------------------------------------------------------- */

interface SelectableCardDescriptionProps extends React.ComponentProps<"p"> {
  asChild?: boolean;
}

function SelectableCardDescription({
  className,
  asChild = false,
  ...props
}: SelectableCardDescriptionProps) {
  const Comp = asChild ? Slot : "p";
  return (
    <Comp
      data-slot="selectable-card-description"
      className={cn("text-sm text-muted-foreground flex-1", className)}
      {...props}
    />
  );
}

export {
  SelectableCard,
  SelectableCardContent,
  SelectableCardDescription,
  SelectableCardIcon,
  SelectableCardTitle,
  selectableCardVariants,
  type SelectableCardContentProps,
  type SelectableCardDescriptionProps,
  type SelectableCardIconProps,
  type SelectableCardProps,
  type SelectableCardTitleProps,
};
