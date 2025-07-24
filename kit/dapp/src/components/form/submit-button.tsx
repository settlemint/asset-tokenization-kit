import { Button } from "@/components/ui/button";
import { useFormContext } from "@/hooks/use-form-contexts";

export function SubmitButton({
  label,
  onSubmit,
}: {
  label: string;
  onSubmit: () => void;
}) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ isSubmitting }) => {
        return (
          <div>
            <Button onClick={onSubmit} disabled={isSubmitting} type="submit">
              {isSubmitting ? "Submitting..." : label}
            </Button>
          </div>
        );
      }}
    </form.Subscribe>
  );
}
