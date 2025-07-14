import { Input } from "@/components/ui/input";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";

export function TextField({
  label,
  postfix,
}: {
  label: string;
  postfix?: string;
}) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();
  return (
    <label>
      <div>{label}</div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          id={field.name}
          value={field.state.value}
          onChange={(e) => {
            field.handleChange(e.target.value);
          }}
          className={cn(
            field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 &&
              "border-destructive"
          )}
        />
        {postfix && (
          <span className="text-sm text-muted-foreground">{postfix}</span>
        )}
      </div>
    </label>
  );
}
