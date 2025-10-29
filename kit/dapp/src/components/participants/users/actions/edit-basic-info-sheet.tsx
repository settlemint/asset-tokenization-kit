import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseActionSheet } from "@/components/manage-dropdown/core/base-action-sheet";
import { authClient } from "@/lib/auth/auth.client";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserReadOutput } from "@/orpc/routes/user/routes/user.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ORPCError } from "@orpc/client";

interface BasicInfoFormState {
  firstName: string;
  lastName: string;
  email: string;
}

interface EditBasicInfoSheetProps {
  user: UserReadOutput;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: BasicInfoFormState) => void;
}

const FORM_ID = "edit-basic-info-form";

/**
 * Side sheet for editing a participant's basic details.
 */
export function EditBasicInfoSheet({
  user,
  open,
  onOpenChange,
  onSubmit,
}: EditBasicInfoSheetProps) {
  const { t } = useTranslation(["user", "common"]);
  const queryClient = useQueryClient();

  const initialFormState = useMemo<BasicInfoFormState>(
    () => ({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
    }),
    [user.email, user.firstName, user.lastName]
  );

  const [formState, setFormState] = useState(initialFormState);

  useEffect(() => {
    setFormState(initialFormState);
  }, [initialFormState, open]);

  const handleFieldChange = useCallback(
    (field: keyof BasicInfoFormState) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, [field]: event.target.value }));
      },
    []
  );

  const handleCancel = useCallback(() => {
    setFormState(initialFormState);
  }, [initialFormState]);

  const { mutateAsync: persistBasicInfo, isPending: isSaving } = useMutation({
    mutationFn: async (values: BasicInfoFormState) => {
      const firstName = values.firstName.trim();
      const lastName = values.lastName.trim();
      const email = values.email.trim();
      const nameParts = [firstName, lastName].filter(Boolean);
      const fallbackName = user.name ?? email;
      const displayName =
        nameParts.length > 0 ? nameParts.join(" ") : fallbackName;

      const { error } = await authClient.admin.updateUser({
        userId: user.id,
        data: {
          name: displayName,
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        },
      });

      if (error) {
        throw new Error(error.message ?? "Failed to update user");
      }

      const existingKyc = await client.user.kyc
        .read({ userId: user.id })
        .catch((readingError: unknown) => {
          if (
            readingError instanceof ORPCError &&
            readingError.status === 404
          ) {
            return undefined;
          }

          throw readingError;
        });

      if (existingKyc) {
        await client.user.kyc.upsert({
          id: existingKyc.id,
          userId: existingKyc.userId,
          firstName: firstName || existingKyc.firstName,
          lastName: lastName || existingKyc.lastName,
          dob: new Date(existingKyc.dob),
          country: existingKyc.country,
          residencyStatus: existingKyc.residencyStatus,
          nationalId: existingKyc.nationalId,
        });
      }

      return {
        firstName,
        lastName,
        email,
      } satisfies BasicInfoFormState;
    },
    onSuccess: async (values) => {
      const readQuery = orpc.user.read.queryOptions({
        input: { userId: user.id },
      });
      const kycReadQuery = orpc.user.kyc.read.queryOptions({
        input: { userId: user.id },
      });
      const meQuery = orpc.user.me.queryOptions();

      // Refresh the detail view and participant listings with the latest profile data.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: readQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: kycReadQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: meQuery.queryKey }),
        queryClient.invalidateQueries({ queryKey: ["orpc", "user", "list"] }),
        queryClient.invalidateQueries({ queryKey: ["orpc", "user", "search"] }),
      ]);

      onSubmit?.(values);
    },
  });

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const submission = persistBasicInfo(formState);

      toast.promise(submission, {
        loading: t("common:actions.saving", { defaultValue: "Saving" }),
        success: t("user:details.basicInfo.success", {
          defaultValue: "User details updated",
        }),
        error: (error: Error) =>
          t("common:error", {
            message: error.message,
            defaultValue: error.message,
          }),
      });

      submission
        .then(() => {
          onOpenChange(false);
        })
        .catch(() => undefined);
    },
    [formState, onOpenChange, persistBasicInfo, t]
  );

  return (
    <BaseActionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("user:details.basicInfo.editTitle", {
        defaultValue: "Edit basic info",
      })}
      description={t("user:details.basicInfo.editDescription", {
        defaultValue: "Update the user's name and email address.",
      })}
      submit={
        <Button type="submit" form={FORM_ID} disabled={isSaving}>
          {t("common:actions.save", { defaultValue: "Save changes" })}
        </Button>
      }
      onCancel={handleCancel}
      showAssetDetails={false}
    >
      <form id={FORM_ID} className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="basic-info-first-name">
            {t("user:fields.firstName", { defaultValue: "First name" })}
          </Label>
          <Input
            id="basic-info-first-name"
            value={formState.firstName}
            onChange={handleFieldChange("firstName")}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="basic-info-last-name">
            {t("user:fields.lastName", { defaultValue: "Last name" })}
          </Label>
          <Input
            id="basic-info-last-name"
            value={formState.lastName}
            onChange={handleFieldChange("lastName")}
            autoComplete="family-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="basic-info-email">
            {t("user:fields.email", { defaultValue: "Email" })}
          </Label>
          <Input
            id="basic-info-email"
            type="email"
            value={formState.email}
            onChange={handleFieldChange("email")}
            autoComplete="email"
          />
        </div>
      </form>
    </BaseActionSheet>
  );
}
