"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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

export interface RelatedGridProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof relatedGridVariants> {
  asChild?: boolean;
}

const RelatedGrid = React.forwardRef<HTMLDivElement, RelatedGridProps>(
  ({ className, gap, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        data-slot="related-grid"
        className={cn(relatedGridVariants({ gap }), className)}
        {...props}
      />
    );
  }
);
RelatedGrid.displayName = "RelatedGrid";

/* -------------------------------------------------------------------------- */
/*                            RelatedGrid Header                              */
/* -------------------------------------------------------------------------- */

export interface RelatedGridHeaderProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const RelatedGridHeader = React.forwardRef<
  HTMLDivElement,
  RelatedGridHeaderProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-slot="related-grid-header"
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  );
});
RelatedGridHeader.displayName = "RelatedGridHeader";

/* -------------------------------------------------------------------------- */
/*                             RelatedGrid Title                              */
/* -------------------------------------------------------------------------- */

export interface RelatedGridTitleProps
  extends React.ComponentPropsWithoutRef<"h2"> {
  asChild?: boolean;
}

const RelatedGridTitle = React.forwardRef<
  HTMLHeadingElement,
  RelatedGridTitleProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "h2";
  return (
    <Comp
      ref={ref}
      data-slot="related-grid-title"
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
});
RelatedGridTitle.displayName = "RelatedGridTitle";

/* -------------------------------------------------------------------------- */
/*                          RelatedGrid Description                           */
/* -------------------------------------------------------------------------- */

export interface RelatedGridDescriptionProps
  extends React.ComponentPropsWithoutRef<"p"> {
  asChild?: boolean;
}

const RelatedGridDescription = React.forwardRef<
  HTMLParagraphElement,
  RelatedGridDescriptionProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "p";
  return (
    <Comp
      ref={ref}
      data-slot="related-grid-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
RelatedGridDescription.displayName = "RelatedGridDescription";

/* -------------------------------------------------------------------------- */
/*                            RelatedGrid Content                             */
/* -------------------------------------------------------------------------- */

export interface RelatedGridContentProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof relatedGridContentVariants> {
  asChild?: boolean;
  animate?: boolean;
}

const RelatedGridContent = React.forwardRef<
  HTMLDivElement,
  RelatedGridContentProps
>(
  (
    {
      className,
      columns,
      gap,
      animate = false,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";

    // Add animation classes to children if animate is true
    const animatedChildren = animate
      ? React.Children.map(children, (child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                className: cn(
                  (child.props as any).className,
                  "animate-in-grid"
                ),
              })
            : child
        )
      : children;

    return (
      <Comp
        ref={ref}
        data-slot="related-grid-content"
        className={cn(relatedGridContentVariants({ columns, gap }), className)}
        {...props}
      >
        {animatedChildren}
      </Comp>
    );
  }
);
RelatedGridContent.displayName = "RelatedGridContent";

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

export interface RelatedGridItemProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof relatedGridItemVariants> {
  asChild?: boolean;
}

const RelatedGridItem = React.forwardRef<HTMLDivElement, RelatedGridItemProps>(
  (
    { className, variant, padding, interactive, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        data-slot="related-grid-item"
        className={cn(
          relatedGridItemVariants({ variant, padding, interactive }),
          className
        )}
        {...props}
      />
    );
  }
);
RelatedGridItem.displayName = "RelatedGridItem";

/* -------------------------------------------------------------------------- */
/*                         RelatedGrid Item Header                            */
/* -------------------------------------------------------------------------- */

export interface RelatedGridItemHeaderProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const RelatedGridItemHeader = React.forwardRef<
  HTMLDivElement,
  RelatedGridItemHeaderProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-slot="related-grid-item-header"
      className={cn("flex items-center justify-between space-x-2", className)}
      {...props}
    />
  );
});
RelatedGridItemHeader.displayName = "RelatedGridItemHeader";

/* -------------------------------------------------------------------------- */
/*                          RelatedGrid Item Title                            */
/* -------------------------------------------------------------------------- */

export interface RelatedGridItemTitleProps
  extends React.ComponentPropsWithoutRef<"h3"> {
  asChild?: boolean;
}

const RelatedGridItemTitle = React.forwardRef<
  HTMLHeadingElement,
  RelatedGridItemTitleProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "h3";
  return (
    <Comp
      ref={ref}
      data-slot="related-grid-item-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
});
RelatedGridItemTitle.displayName = "RelatedGridItemTitle";

/* -------------------------------------------------------------------------- */
/*                       RelatedGrid Item Description                         */
/* -------------------------------------------------------------------------- */

export interface RelatedGridItemDescriptionProps
  extends React.ComponentPropsWithoutRef<"p"> {
  asChild?: boolean;
}

const RelatedGridItemDescription = React.forwardRef<
  HTMLParagraphElement,
  RelatedGridItemDescriptionProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "p";
  return (
    <Comp
      ref={ref}
      data-slot="related-grid-item-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
RelatedGridItemDescription.displayName = "RelatedGridItemDescription";

/* -------------------------------------------------------------------------- */
/*                         RelatedGrid Item Content                           */
/* -------------------------------------------------------------------------- */

export interface RelatedGridItemContentProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const RelatedGridItemContent = React.forwardRef<
  HTMLDivElement,
  RelatedGridItemContentProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-slot="related-grid-item-content"
      className={cn("flex-1", className)}
      {...props}
    />
  );
});
RelatedGridItemContent.displayName = "RelatedGridItemContent";

/* -------------------------------------------------------------------------- */
/*                         RelatedGrid Item Footer                            */
/* -------------------------------------------------------------------------- */

export interface RelatedGridItemFooterProps
  extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const RelatedGridItemFooter = React.forwardRef<
  HTMLDivElement,
  RelatedGridItemFooterProps
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-slot="related-grid-item-footer"
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  );
});
RelatedGridItemFooter.displayName = "RelatedGridItemFooter";

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

export {
  RelatedGrid,
  RelatedGridHeader,
  RelatedGridTitle,
  RelatedGridDescription,
  RelatedGridContent,
  RelatedGridItem,
  RelatedGridItemHeader,
  RelatedGridItemTitle,
  RelatedGridItemDescription,
  RelatedGridItemContent,
  RelatedGridItemFooter,
  relatedGridVariants,
  relatedGridContentVariants,
  relatedGridItemVariants,
};
