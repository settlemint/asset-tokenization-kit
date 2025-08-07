import { Button } from "@/components/ui/button";
import { useFormContext } from "@/hooks/use-form-contexts";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { useState } from "react";
import { VerificationDialog } from "../verification-dialog/verification-dialog";

export function SecureSubmitButton({
  label,
  onSubmit,
  disabled = false,
  verification,
}: {
  label: string;
  onSubmit: () => void;
  disabled?: boolean;
  verification: {
    label: string;
    description: string;
    setField: (verfication: UserVerification) => void;
  };
}) {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
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
          <div>
            <Button
              onClick={() => {
                setShowVerificationDialog(true);
              }}
              disabled={disabled || isSubmitting || !isValid}
              type="button"
            >
              {isSubmitting ? "Submitting..." : label}
            </Button>
            <VerificationDialog
              open={showVerificationDialog}
              onOpenChange={setShowVerificationDialog}
              title={verification.label}
              description={verification.description}
              onSubmit={async (userVerification) => {
                verification.setField(userVerification);

                await form.validateAllFields("change");
                if (form.state.isValid) {
                  onSubmit();
                }
              }}
            />
          </div>
        );
      }}
    </form.Subscribe>
  );
}
