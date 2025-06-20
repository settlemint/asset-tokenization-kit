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
      toast.error("System address not found. Please ensure a system is deployed first.");
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
      // TODO: Add translations for factory creation messages
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
          {t("asset-selection.continue")}
        </Button>
      </form>
    </Form>
  );
}
