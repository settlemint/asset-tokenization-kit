import { BaseActionSheet } from "@/components/manage-dropdown/core/base-action-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth.client";
import { client, orpc } from "@/orpc/orpc-client";
import type { UserReadOutput } from "@/orpc/routes/user/routes/user.read.schema";
import { ORPCError } from "@orpc/client";
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
  canEdit?: boolean;
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
  canEdit = true,
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
        type KycUpsertPayload = Parameters<typeof client.user.kyc.upsert>[0];

        const rawDob = existingKyc.dob;
        const parsedDob = (() => {
          if (!rawDob) {
            return undefined;
          }

          const candidate = rawDob instanceof Date ? rawDob : new Date(rawDob);
          return Number.isNaN(candidate.getTime()) ? undefined : candidate;
        })();

        const kycPayload: Omit<KycUpsertPayload, "dob"> & {
          dob?: Date;
        } = {
          id: existingKyc.id,
          userId: existingKyc.userId,
          firstName: firstName || existingKyc.firstName,
          lastName: lastName || existingKyc.lastName,
          country: existingKyc.country,
          residencyStatus: existingKyc.residencyStatus,
          nationalId: existingKyc.nationalId,
          ...(parsedDob ? { dob: parsedDob } : {}),
        };

        await client.user.kyc.upsert(kycPayload as KycUpsertPayload);
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
      if (!canEdit) {
        return;
      }
      const submission = persistBasicInfo(formState);

      toast.promise(submission, {
        loading: t("common:actions.saving"),
        success: t("user:details.basicInfo.success"),
        error: (error: Error) =>
          t("common:error", {
            message: error.message,
          }),
      });

      submission
        .then(() => {
          onOpenChange(false);
        })
        .catch(() => undefined);
    },
    [canEdit, formState, onOpenChange, persistBasicInfo, t]
  );

  return (
    <BaseActionSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("user:details.basicInfo.editTitle")}
      description={t("user:details.basicInfo.editDescription")}
      submit={
        <Button type="submit" form={FORM_ID} disabled={!canEdit || isSaving}>
          {t("common:actions.save")}
        </Button>
      }
      onCancel={handleCancel}
      showAssetDetails={false}
    >
      <form id={FORM_ID} className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="basic-info-first-name">
            {t("user:fields.firstName")}
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
            {t("user:fields.lastName")}
          </Label>
          <Input
            id="basic-info-last-name"
            value={formState.lastName}
            onChange={handleFieldChange("lastName")}
            autoComplete="family-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="basic-info-email">{t("user:fields.email")}</Label>
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
