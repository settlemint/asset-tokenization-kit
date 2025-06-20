import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { assetTypeArray } from "@/lib/zod/validators/asset-types";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { orpc } from "@/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod/v4";

const assetSelectionSchema = z.object({
  selectedAssets: assetTypeArray(),
});

type AssetSelectionFormData = z.infer<typeof assetSelectionSchema>;

interface AssetSelectionStepProps {
  onSuccess?: () => void;
}

export function AssetSelectionStep({ onSuccess }: AssetSelectionStepProps) {
  const { t } = useTranslation("onboarding");
  
  // Fetch system address from settings
  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
  );

  const assetOptions = [
    { value: "bond", label: t("assets.bond") },
    { value: "equity", label: t("assets.equity") },
    { value: "fund", label: t("assets.fund") },
    { value: "stablecoin", label: t("assets.stablecoin") },
    { value: "deposit", label: t("assets.deposit") },
  ] as const;

  const form = useForm<AssetSelectionFormData>({
    resolver: zodResolver(assetSelectionSchema),
    defaultValues: {
      selectedAssets: [],
    },
  });

  const selectedAssets = form.watch("selectedAssets");

  const { mutate: createFactories, isPending } = useStreamingMutation({
    mutationOptions: orpc.tokens.factoryCreate.mutationOptions(),
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
  });

  const onSubmit = (data: AssetSelectionFormData) => {
    if (!systemAddress?.value) {
      toast.error(t("create-factory-messages.system-not-found"));
      return;
    }

    // Convert selected assets to factory creation format
    const factories = data.selectedAssets.map(type => ({
      type: type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Token Factory`
    }));

    createFactories({
      contract: systemAddress.value,
      factories,
      messages: {
        initialLoading: t("create-factory-messages.initial-loading"),
        noResultError: t("create-factory-messages.no-result-error"),
        defaultError: t("create-factory-messages.default-error"),
        factoryCreated: t("create-factory-messages.factory-created"),
        creatingFactory: t("create-factory-messages.creating-factory"),
        factoryCreationFailed: t("create-factory-messages.factory-creation-failed"),
        systemNotBootstrapped: t("create-factory-messages.system-not-bootstrapped"),
        batchProgress: t("create-factory-messages.multiple-factories.deploying"),
        batchCompleted: t("create-factory-messages.multiple-factories.all-completed"),
        streamTimeout: t("create-factory-messages.transaction-tracking.stream-timeout"),
        waitingForMining: t("create-factory-messages.transaction-tracking.waiting-for-mining"),
        transactionFailed: t("create-factory-messages.transaction-tracking.transaction-failed"),
        transactionDropped: t("create-factory-messages.transaction-tracking.transaction-dropped"),
        waitingForIndexing: t("create-factory-messages.transaction-tracking.waiting-for-indexing"),
        transactionIndexed: t("create-factory-messages.transaction-tracking.transaction-indexed"),
        indexingTimeout: t("create-factory-messages.transaction-tracking.indexing-timeout"),
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="selectedAssets"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">
                  {t("asset-selection.title")}
                </FormLabel>
                <FormDescription>
                  {t("asset-selection.description")}
                </FormDescription>
              </div>
              <div className="space-y-2">
                {assetOptions.map((asset) => (
                  <FormField
                    key={asset.value}
                    control={form.control}
                    name="selectedAssets"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={asset.value}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value.includes(asset.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, asset.value]);
                                } else {
                                  field.onChange(
                                    field.value.filter(
                                      (value) => value !== asset.value
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {asset.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isPending || selectedAssets.length === 0 || !systemAddress?.value}
        >
          {isPending ? t("create-factory-messages.button.deploying") : t("create-factory-messages.button.deploy")}
        </Button>
      </form>
    </Form>
  );
}
