import { Slot } from "@radix-ui/react-slot";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useStore } from "@tanstack/react-form";

import { useFieldContext as _useFieldContext } from "@/hooks/use-form-contexts";

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

const useFieldContext = () => {
  const { id } = React.useContext(FormItemContext);
  const { name, store, ...fieldContext } = _useFieldContext();

  const errors = (useStore(store, (state) => state.meta.errors) ??
    []) as Array<{
    message?: string;
  }>;

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    errors,
    store,
    ...fieldContext,
  };
};

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { formItemId, errors, getMeta } = useFieldContext();
  const meta = getMeta();
  const hasError = errors.length > 0 && meta.isTouched;
  return (
    <Label
      data-slot="form-label"
      data-error={hasError}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { errors, formItemId, formDescriptionId, formMessageId } =
    useFieldContext();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        errors.length === 0
          ? formDescriptionId
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={errors.length > 0}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFieldContext();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { errors, formMessageId } = useFieldContext();
  const body = errors.length > 0 ? (errors[0]?.message ?? "") : props.children;
  if (!body) return null;

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export { FormControl, FormDescription, FormItem, FormLabel, FormMessage };
