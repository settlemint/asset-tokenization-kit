"use client";

import components from "@/components/blocks/formity/components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { waitForTransactionReceipt } from "@/lib/transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { Formity, type Value } from "formity";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { createTokenAction } from "./create-token-action";
import schema from "./create-token-form-poc-wizard-schema";
import type { CreateTokenSchemaType } from "./create-token-form-schema";
import { CreateTokenSchema, createTokenFormPageFields } from "./create-token-form-schema";

interface CreateTokenFormProps {
  defaultValues: Partial<CreateTokenSchemaType>;
  formId: string;
  className?: string;
}

const CreateTokenReceiptQuery = portalGraphql(`
query CreateTokenReceiptQuery($transactionHash: String!) {
  StarterKitERC20FactoryCreateTokenReceipt(transactionHash: $transactionHash) {
    contractAddress
    status
    blockNumber
    revertReasonDecoded
  }
}`);

export function CreateTokenFormPocWizard({ defaultValues }: CreateTokenFormProps) {
  const [localStorageState] = useLocalStorage<Partial<CreateTokenSchemaType>>("state", defaultValues);

  const { form, resetFormAndAction } = useHookFormAction(createTokenAction, zodResolver(CreateTokenSchema), {
    actionProps: {
      onSuccess: () => {
        resetFormAndAction();
      },
    },
    formProps: {
      mode: "all",
      defaultValues: {
        ...createTokenFormPageFields,
        ...defaultValues,
        ...localStorageState,
      },
    },
    errorMapProps: {},
  });

  function onReturn(result: Value) {
    console.log(result);
  }

  function onSubmit(values: CreateTokenSchemaType) {
    toast.promise(
      async () => {
        const transactionHash = await createTokenAction(values);
        return waitForTransactionReceipt({
          receiptFetcher: async () => {
            const txresult = await portalClient.request(CreateTokenReceiptQuery, {
              transactionHash: transactionHash?.data ?? "",
            });

            return txresult.StarterKitERC20FactoryCreateTokenReceipt;
          },
        });
      },
      {
        loading: "Creating token...",
        success: (data) => {
          return `${values.tokenName} (${values.tokenSymbol}) created in block ${data.blockNumber} on ${data.contractAddress}`;
        },
        error: (error) => {
          console.error(error);
          return `Error: ${error instanceof Error ? error.message : "An unexpected error occurred"}`;
        },
      },
    );
    // TODO: update the table
  }

  return (
    <div className="TokenizationWizard container mt-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create a new token</CardTitle>
          <CardDescription>Issue a new token.</CardDescription>
        </CardHeader>
        <CardContent>
          <Formity components={components} schema={schema} onReturn={onReturn} />
        </CardContent>
      </Card>
    </div>
  );
}
