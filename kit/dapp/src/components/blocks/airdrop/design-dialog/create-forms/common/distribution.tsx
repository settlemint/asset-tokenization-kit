import { DocumentUpload } from "@/components/blocks/document-upload/document-upload";
import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormDescription, FormLabel } from "@/components/ui/form";
import type { AirdropDistributionList } from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
import { AirdropDistributionListSchema } from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
import type { CreateStandardAirdropInput } from "@/lib/mutations/airdrop/create/standard/create-schema";
import { safeParse } from "@/lib/utils/typebox";
import { useTranslations } from "next-intl";
import { parse } from "papaparse";
import { useFormContext } from "react-hook-form";

export function Distribution() {
  const { setError, clearErrors, setValue } = useFormContext<{
    distribution: AirdropDistributionList;
  }>();
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

          const fileText = await file.text();
          const parseResult = parse<string[][]>(fileText);
          if (parseResult.errors.length > 0) {
            console.error("Error processing CSV:", parseResult.errors);
            setError("distribution", {
              type: "manual",
              message:
                "An unexpected error occurred while processing the file.",
            });
            return;
          }

          try {
            // Skip header row and transform data
            const jsonData = parseResult.data.slice(1).map((row) => ({
              amount: row[0],
              recipient: row[1],
            }));

            if (jsonData.length === 0) {
              setError("distribution", {
                type: "manual",
                message: "The CSV file is empty or does not contain data.",
              });
              return;
            }
            const distribution = safeParse(
              AirdropDistributionListSchema,
              jsonData
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
