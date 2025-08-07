import { VerificationButton as VerificationButtonComponent } from "@/components/verification-dialog/verification-button";
import { useFormContext } from "@/hooks/use-form-contexts";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";

export function VerificationButton({
  children,
  onSubmit,
  disabled = false,
  verification,
}: {
  children: React.ReactNode;
  onSubmit: () => void;
  disabled?: boolean;
  verification: {
    title: string;
    description: string;
    setField: (verfication: UserVerification) => void;
  };
}) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        isValid: state.isValid,
      })}
    >
      {({ isSubmitting, isValid }) => {
        return (
          <VerificationButtonComponent
            verification={verification}
            onSubmit={async (userVerification) => {
              verification.setField(userVerification);
              await form.validateAllFields("change");
              if (form.state.isValid) {
                onSubmit();
              }
            }}
            disabled={disabled || isSubmitting || !isValid}
          >
            {children}
          </VerificationButtonComponent>
        );
      }}
    </form.Subscribe>
  );
}
