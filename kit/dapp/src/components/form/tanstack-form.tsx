import * as React from "react";
import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <Label data-slot="form-label" className={className} {...props} />;
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { id } = React.useContext(FormItemContext);

  return <Slot data-slot="form-control" id={id} {...props} />;
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { id } = React.useContext(FormItemContext);

  return (
    <p
      data-slot="form-description"
      id={`${id}-form-description`}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  const { id } = React.useContext(FormItemContext);

  if (!children) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={`${id}-form-message`}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export { FormItem, FormLabel, FormControl, FormDescription, FormMessage };
