import { useFormContext } from "@/hooks/use-form-contexts";

export function Errors() {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        errors: state.errors,
      })}
    >
      {({ errors }) => {
        return errors.length > 0 ? (
          <p className="text-destructive text-sm">{JSON.stringify(errors)}</p>
        ) : null;
      }}
    </form.Subscribe>
  );
}
