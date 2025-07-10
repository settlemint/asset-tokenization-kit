import { FormInput } from "@/components/form/inputs/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc";
import {
  TokenCreateSchema,
  type TokenCreateInput,
} from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const logger = createLogger();

interface CreateDepositFormProps {
  onSuccess?: () => void;
}

export function CreateDepositForm({ onSuccess }: CreateDepositFormProps) {
  const { t } = useTranslation("asset-designer");

  const form = useForm({
    resolver: zodResolver(TokenCreateSchema),
    defaultValues: {
      type: AssetTypeEnum.deposit,
      verification: {
        verificationCode: "111111",
        verificationType: "pincode",
      },
      messages: {
        initialLoading: t("streaming-messages.initial-loading", {
          type: AssetTypeEnum.deposit,
        }),
        noResultError: t("streaming-messages.no-result-error", {
          type: AssetTypeEnum.deposit,
        }),
        defaultError: t("streaming-messages.default-error", {
          type: AssetTypeEnum.deposit,
        }),
        creatingToken: t("messages.creating", {
          type: AssetTypeEnum.deposit,
        }),
        tokenCreated: t("messages.created", {
          type: AssetTypeEnum.deposit,
        }),
        tokenCreationFailed: t("messages.creation-failed", {
          type: AssetTypeEnum.deposit,
        }),
      },
    },
    mode: "onChange",
  });

  const { mutate: createDeposit, isPending } = useStreamingMutation({
    mutationOptions: orpc.token.create.mutationOptions(),
    onSuccess: (transactionHash) => {
      logger.info("Transaction hash", { transactionHash });
      form.reset();
      onSuccess?.();
    },
  });

  // Handle form submission
  const onSubmit = useCallback(
    (data: TokenCreateInput) => {
      createDeposit({
        ...data,
      });
    },
    [createDeposit]
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {t("form.title", { type: AssetTypeEnum.deposit })}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {t("form.description", { type: AssetTypeEnum.deposit })}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                control={form.control}
                name="name"
                label={t("form.fields.name.label")}
                placeholder={t("form.fields.name.placeholder", {
                  type: AssetTypeEnum.deposit,
                })}
                description={t("form.fields.name.description")}
                required
                maxLength={50}
              />
              <FormInput
                control={form.control}
                name="symbol"
                label={t("form.fields.symbol.label")}
                placeholder={t("form.fields.symbol.placeholder")}
                description={t("form.fields.symbol.description")}
                required
                maxLength={10}
              />
            </div>

            <FormInput
              control={form.control}
              name="decimals"
              label={t("form.fields.decimals.label")}
              type="number"
              min={0}
              max={18}
              placeholder={t("form.fields.decimals.placeholder")}
              description={t("form.fields.decimals.description")}
              required
            />
            <FormInput
              control={form.control}
              name="isin"
              label={t("form.fields.isin.label")}
              placeholder={t("form.fields.isin.placeholder")}
              description={t("form.fields.isin.description")}
              maxLength={12}
              required={false}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("form.actions.creating")
              : t("form.actions.create", { type: AssetTypeEnum.deposit })}
          </Button>
        </form>
      </Form>
    </div>
  );
}

CreateDepositForm.displayName = "CreateDepositForm";
