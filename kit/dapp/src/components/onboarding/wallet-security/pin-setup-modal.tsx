import { PincodeInput } from "@/components/form/inputs/pincode-input";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/auth.client";
import { pincode } from "@atk/zod/pincode";
import { useForm } from "@tanstack/react-form";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface PinSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export function PinSetupModal({ open, onClose }: PinSetupModalProps) {
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

        // Only validate when both PINs are complete (6 digits) and don't match
        if (
          value.pincode.length === 6 &&
          value.confirmPincode.length === 6 &&
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
      // Validate PIN format before submission
      const pincodeResult = pincode().safeParse(value.pincode);
      if (!pincodeResult.success) {
        toast.error(t("wallet-security.pincode.invalid-pin-format"));
        return;
      }

      try {
        await authClient.pincode.enable({
          pincode: value.pincode,
        });
        await refreshUserState();
        toast.success(t("wallet-security.pincode.success"));
        handleClose();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : t("wallet-security.pincode.setup-failed");
        toast.error(errorMessage);
      }
    },
  });

  const handleClose = useCallback(() => {
    form.reset();
    onClose();
  }, [form, onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("wallet-security.pincode.title")}</DialogTitle>
          <DialogDescription>
            {t("wallet-security.pincode.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Subscribe>
            {(state) => {
              const showConfirmField = state.values.pincode.length === 6;
              const isValid =
                state.values.pincode.length === 6 &&
                state.values.confirmPincode.length === 6 &&
                state.values.pincode === state.values.confirmPincode &&
                state.errors.length === 0;

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

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      {t("common:actions.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isValid || state.isSubmitting}
                    >
                      {state.isSubmitting
                        ? t("wallet-security.pincode.submitting")
                        : t("wallet-security.pincode.set-pin")}
                    </Button>
                  </DialogFooter>
                </div>
              );
            }}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
