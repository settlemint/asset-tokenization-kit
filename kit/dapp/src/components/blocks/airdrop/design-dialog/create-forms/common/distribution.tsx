import { DocumentUpload } from "@/components/blocks/document-upload/document-upload";
import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
import { FormStep } from "@/components/blocks/form/form-step";
import { FormDescription, FormLabel } from "@/components/ui/form";
import type { CreateAirdropInput } from "@/lib/mutations/airdrop/create/common/schema";
import { useTranslations } from "next-intl";
import { parse } from "papaparse";
import type { PropsWithChildren } from "react";
import { useFormContext } from "react-hook-form";
import { getAddress, parseUnits } from "viem";

export function Distribution({ children }: PropsWithChildren) {
  const { setError, clearErrors, setValue, getValues } =
    useFormContext<CreateAirdropInput>();
  const t = useTranslations("private.airdrops.create.distribution");

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-4"
    >
      {children}
      <FormLabel>
        {t("distribution-label")}
        <span className="-ml-1 text-destructive">*</span>
      </FormLabel>
      <DocumentUpload
        onSelect={async (file) => {
          clearErrors("distribution");

          const fileText = await file.text();
          const parseResult = parse<string[]>(fileText);
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
            const asset = getValues("asset");
            const decimals = asset.decimals;

            // Skip header row and transform data
            const distribution = parseResult.data
              .slice(1)
              .map((row, index) => ({
                amount: Number(row[0]),
                amountExact: parseUnits(String(row[0]), decimals).toString(),
                recipient: getAddress(row[1]),
                index,
              }));

            if (distribution.length === 0) {
              setError("distribution", {
                type: "manual",
                message: "The CSV file is empty or does not contain data.",
              });
              return;
            }

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
] satisfies (keyof CreateAirdropInput)[];
