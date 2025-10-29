import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Children, cloneElement, isValidElement } from "react";

/* -------------------------------------------------------------------------- */
/*                             RelatedGrid Container                          */
/* -------------------------------------------------------------------------- */

const relatedGridVariants = cva("flex flex-col", {
  variants: {
    gap: {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
  },
  defaultVariants: {
    gap: "md",
  },
});

const relatedGridContentVariants = cva("grid w-full", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      "auto-fit": "grid-cols-[repeat(auto-fit,minmax(280px,1fr))]",
      "auto-fill": "grid-cols-[repeat(auto-fill,minmax(280px,1fr))]",
    },
    gap: {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    },
  },
  defaultVariants: {
    columns: 3,
    gap: "md",
  },
});

function RelatedGrid({
  className,
  gap,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof relatedGridVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="related-grid"
      className={cn(relatedGridVariants({ gap }), className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                            RelatedGrid Header                              */
/* -------------------------------------------------------------------------- */

function RelatedGridHeader({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="related-grid-header"
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                             RelatedGrid Title                              */
/* -------------------------------------------------------------------------- */

function RelatedGridTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h2"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "h2";
  return (
    <Comp
      data-slot="related-grid-title"
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                          RelatedGrid Description                           */
/* -------------------------------------------------------------------------- */

function RelatedGridDescription({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"p"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "p";
  return (
    <Comp
      data-slot="related-grid-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                            RelatedGrid Content                             */
/* -------------------------------------------------------------------------- */

function RelatedGridContent({
  className,
  columns,
  gap,
  animate = false,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof relatedGridContentVariants> & {
    asChild?: boolean;
    animate?: boolean;
  }) {
  const Comp = asChild ? Slot : "div";

  // Add animation classes to children if animate is true
  const animatedChildren = animate
    ? Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ className?: string }>, {
              className: cn(
                (child.props as { className?: string }).className,
                "animate-in-grid"
              ),
            })
          : child
      )
    : children;

  return (
    <Comp
      data-slot="related-grid-content"
      className={cn(relatedGridContentVariants({ columns, gap }), className)}
      {...props}
    >
      {animatedChildren}
    </Comp>
  );
}

/* -------------------------------------------------------------------------- */
/*                             RelatedGrid Item                               */
/* -------------------------------------------------------------------------- */

const relatedGridItemVariants = cva(
  "flex h-full flex-col overflow-hidden transition-all duration-200",
  {
    variants: {
      variant: {
        default: "rounded-xl border bg-card text-card-foreground shadow-sm",
        gradient: "linear-gradient-related rounded-xl text-foreground",
        outline: "rounded-xl border-2 bg-transparent",
        ghost: "rounded-xl",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover-lift press-effect",
        false: "",
      },
    },
    defaultVariants: {
      variant: "gradient",
      padding: "md",
      interactive: false,
    },
  }
);

function RelatedGridItem({
  className,
  variant,
  padding,
  interactive,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof relatedGridItemVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="related-grid-item"
      className={cn(
        relatedGridItemVariants({ variant, padding, interactive }),
        className
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                         RelatedGrid Item Header                            */
/* -------------------------------------------------------------------------- */

function RelatedGridItemHeader({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="related-grid-item-header"
      className={cn("flex items-center justify-between space-x-2", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                          RelatedGrid Item Title                            */
/* -------------------------------------------------------------------------- */

function RelatedGridItemTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"h3"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "h3";
  return (
    <Comp
      data-slot="related-grid-item-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                       RelatedGrid Item Description                         */
/* -------------------------------------------------------------------------- */

function RelatedGridItemDescription({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"p"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "p";
  return (
    <Comp
      data-slot="related-grid-item-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                         RelatedGrid Item Content                           */
/* -------------------------------------------------------------------------- */

function RelatedGridItemContent({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="related-grid-item-content"
      className={cn("flex-1", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                         RelatedGrid Item Footer                            */
/* -------------------------------------------------------------------------- */

function RelatedGridItemFooter({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="related-grid-item-footer"
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

export {
  RelatedGrid,
  RelatedGridContent,
  relatedGridContentVariants,
  RelatedGridDescription,
  RelatedGridHeader,
  RelatedGridItem,
  RelatedGridItemContent,
  RelatedGridItemDescription,
  RelatedGridItemFooter,
  RelatedGridItemHeader,
  RelatedGridItemTitle,
  relatedGridItemVariants,
  RelatedGridTitle,
  relatedGridVariants,
};
