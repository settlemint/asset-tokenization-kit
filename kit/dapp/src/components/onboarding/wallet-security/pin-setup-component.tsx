import { PincodeInput } from "@/components/form/inputs/pincode-input";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { pincode } from "@/lib/zod/validators/pincode";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function PinSetupComponent({ closeModal }: { closeModal: () => void }) {
  const { refreshUserState } = useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "common"]);

  const form = useForm({
    defaultValues: {
      pincode: "",
      confirmPincode: "",
    },
    validators: {
      onChange: ({ value }) => {
        const errors: Partial<Record<keyof typeof value, string>> = {};

        // Validate pincode
        if (value.pincode) {
          const pincodeResult = pincode().safeParse(value.pincode);
          if (!pincodeResult.success) {
            errors.pincode = t("wallet-security.pincode.invalid-pin-format");
          }
        }

        // Validate confirmPincode
        if (value.confirmPincode) {
          const confirmResult = pincode().safeParse(value.confirmPincode);
          if (!confirmResult.success) {
            errors.confirmPincode = t(
              "wallet-security.pincode.invalid-pin-format"
            );
          }
        }

        // Check match when both are complete
        if (
          Object.keys(errors).length === 0 &&
          value.pincode.length === value.confirmPincode.length &&
          value.pincode !== value.confirmPincode
        ) {
          errors.confirmPincode = t(
            "wallet-security.pincode.pin-codes-dont-match"
          );
        }

        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await authClient.pincode.enable({
        pincode: value.pincode,
      });
      await refreshUserState();
      toast.success(t("wallet-security.pincode.success"));
      closeModal();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="max-w-md mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {t("wallet-security.pincode.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("wallet-security.pincode.description")}
        </p>
      </div>

      <form.Subscribe>
        {(state) => {
          const showConfirmField = state.values.pincode.length === 6;
          const isValid =
            state.values.pincode.length === 6 &&
            state.values.confirmPincode.length === 6 &&
            state.values.pincode === state.values.confirmPincode &&
            !state.errors.length;

          return (
            <div className="space-y-6">
              <form.Field name="pincode">
                {(field) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium block text-center">
                      {t("wallet-security.pincode.enter-pin")}
                    </label>
                    <div className="flex justify-center">
                      <PincodeInput
                        value={field.state.value}
                        onChange={field.handleChange}
                        autoFocus
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive text-center">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {showConfirmField && (
                <form.Field name="confirmPincode">
                  {(field) => (
                    <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <label className="text-sm font-medium block text-center">
                        {t("wallet-security.pincode.confirm-pin")}
                      </label>
                      <div className="flex justify-center">
                        <PincodeInput
                          value={field.state.value}
                          onChange={field.handleChange}
                        />
                      </div>
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive text-center">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                      {field.state.value.length === 6 &&
                        state.values.pincode === field.state.value &&
                        field.state.meta.errors.length === 0 && (
                          <p className="text-sm text-green-600 text-center">
                            {t("wallet-security.pincode.pin-codes-match")}
                          </p>
                        )}
                    </div>
                  )}
                </form.Field>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  {t("common:actions.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || state.isSubmitting}
                  className="flex-1"
                >
                  {state.isSubmitting
                    ? t("wallet-security.pincode.submitting")
                    : t("wallet-security.pincode.set-pin")}
                </Button>
              </div>
            </div>
          );
        }}
      </form.Subscribe>
    </form>
  );
}
