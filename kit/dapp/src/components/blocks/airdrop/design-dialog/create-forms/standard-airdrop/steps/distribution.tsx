import { DocumentUpload } from "@/components/blocks/document-upload/document-upload";
import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { AirdropDistributionSchema } from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
import type { CreateStandardAirdropInput } from "@/lib/mutations/airdrop/create/standard/create-schema";
import { csvToJson } from "@/lib/utils/csv-json";
import { safeParse } from "@/lib/utils/typebox";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function Distribution() {
  const { setError, clearErrors, setValue } =
    useFormContext<CreateStandardAirdropInput>();
  const t = useTranslations("private.airdrops.create.distribution");

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-4"
    >
      <FormLabel>{t("distribution-label")}</FormLabel>
      <DocumentUpload
        onSelect={async (file) => {
          clearErrors("distribution");
          let jsonResult: Record<string, string>[] = [];
          try {
            jsonResult = await csvToJson(file, { lowerCase: true });

            if (jsonResult.length === 0) {
              setError("distribution", {
                type: "manual",
                message: "The CSV file is empty or does not contain data.",
              });
              return;
            }
          } catch (error) {
            console.error("Error processing CSV:", error);
            setError("distribution", {
              type: "manual",
              message:
                "An unexpected error occurred while processing the file.",
            });
          }

          try {
            const distribution = safeParse(
              AirdropDistributionSchema,
              jsonResult
            );

            setValue("distribution", distribution);
          } catch (error) {
            console.error("Error processing CSV:", error);
            setError("distribution", {
              type: "manual",
              message:
                "The CSV file is not valid. Please ensure the columns are named 'amount' and 'recipient'.",
            });
          }
        }}
        acceptedFileTypes={["text/csv"]}
      />
      <FormDescription>{t("distribution-description")}</FormDescription>

      <TranslatableFormFieldMessage />
    </FormStep>
  );
}

Distribution.validatedFields = [
  "distribution",
] satisfies (keyof CreateStandardAirdropInput)[];
