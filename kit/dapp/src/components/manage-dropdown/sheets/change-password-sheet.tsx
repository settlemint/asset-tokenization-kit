import { FormStepContent } from "@/components/form/multi-step/form-step";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { authClient } from "@/lib/auth/auth.client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

interface ChangePasswordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof ChangePasswordFormSchema>;

export function ChangePasswordSheet({
  open,
  onOpenChange,
  user,
}: ChangePasswordSheetProps) {
  const { t } = useTranslation(["user", "common"]);
  const queryClient = useQueryClient();
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  const baseValues = useMemo<ChangePasswordFormValues>(
    () => ({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }),
    []
  );

  const form = useAppForm({
    defaultValues: baseValues,
    validators: {
      onChange: ChangePasswordFormSchema,
    },
    onSubmit: () => {},
  });

  const resetSheetState = useCallback(() => {
    form.reset(baseValues);
    sheetStoreRef.current.setState((state) => ({ ...state, step: "values" }));
  }, [baseValues, form]);

  useEffect(() => {
    if (open) {
      resetSheetState();
    }
  }, [open, resetSheetState]);

  const { mutateAsync: changePassword, isPending: isSubmitting } = useMutation({
    mutationFn: async (input: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const { data, error } = await authClient.changePassword({
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true, // Always revoke other sessions for security
      });

      if (error) {
        throw new Error(error.message || "Failed to change password");
      }

      return data;
    },
    onSuccess: async () => {
      // Invalidate user session queries
      await queryClient.invalidateQueries({
        queryKey: ["auth", "session"],
        refetchType: "all",
      });
    },
  });

  const handleClose = useCallback(() => {
    resetSheetState();
    onOpenChange(false);
  }, [onOpenChange, resetSheetState]);

  const handleSubmit = useCallback(
    (_walletVerification: UserVerification) => {
      const currentPassword = form.getFieldValue("currentPassword");
      const newPassword = form.getFieldValue("newPassword");

      const payload = {
        currentPassword,
        newPassword,
      };

      const parsed = ChangePasswordFormSchema.safeParse({
        ...payload,
        confirmPassword: form.getFieldValue("confirmPassword"),
      });

      if (!parsed.success) {
        toast.error(
          parsed.error.issues[0]?.message ??
            t("common:error", { message: t("common:unknown") })
        );
        return;
      }

      toast
        .promise(changePassword(payload), {
          loading: t("common:saving"),
          success: t("user:profile.changePassword.success"),
          error: (error: Error) =>
            t("common:error", { message: error.message }),
        })
        .unwrap()
        .then(() => {
          handleClose();
        })
        .catch(() => undefined);
    },
    [changePassword, form, handleClose, t]
  );

  return (
    <form.Subscribe
      selector={(state) => ({
        values: state.values as Partial<ChangePasswordFormValues>,
        errors: state.errors,
      })}
    >
      {({ values, errors }) => {
        const mergedValues: ChangePasswordFormValues = {
          ...baseValues,
          ...values,
        };

        const errorKeys = Object.keys(errors ?? {});
        const hasFieldErrors = errorKeys.length > 0;

        const hasChanges = Boolean(
          mergedValues.currentPassword &&
            mergedValues.newPassword &&
            mergedValues.confirmPassword
        );

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("user:profile.changePassword.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <span className="text-sm font-medium">
                    {t("user:profile.changePassword.description")}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Your password will be updated for account: {user.email}
                  </span>
                </div>

                <div className="flex flex-col space-y-1 rounded-md bg-muted/50 p-3">
                  <span className="text-sm font-medium">
                    {t("user:profile.changePassword.revokeOtherSessions")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(
                      "user:profile.changePassword.revokeOtherSessionsDescription"
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

        const canContinue = () => hasChanges && !hasFieldErrors;

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={handleClose}
            title={t("user:profile.changePassword.title")}
            description={t("user:profile.changePassword.description")}
            submitLabel={t("common:save")}
            isSubmitting={isSubmitting}
            disabled={() => isSubmitting}
            canContinue={canContinue}
            onSubmit={handleSubmit}
            store={sheetStoreRef.current}
            showAssetDetailsOnConfirm={false}
            confirm={confirmView}
          >
            <div className="space-y-6">
              <FormStepContent fullWidth>
                <form.AppField name="currentPassword">
                  {(field) => (
                    <field.TextField
                      label={t("user:profile.changePassword.currentPassword")}
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  )}
                </form.AppField>

                <form.AppField name="newPassword">
                  {(field) => (
                    <field.TextField
                      label={t("user:profile.changePassword.newPassword")}
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                  )}
                </form.AppField>

                <form.AppField name="confirmPassword">
                  {(field) => (
                    <field.TextField
                      label={t("user:profile.changePassword.confirmPassword")}
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                  )}
                </form.AppField>
              </FormStepContent>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
