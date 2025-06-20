import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { queryClient } from "@/lib/query.client";
// import { assetTypes } from "@/lib/zod/validators/asset-types";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { orpc } from "@/orpc";
import { TokenTypeEnum } from "@/orpc/routes/tokens/routes/factory.create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod/v4";

const assetSelectionSchema = z.object({
  assets: z.array(TokenTypeEnum).min(1, "Select at least one asset type"),
});

type AssetSelectionFormValues = z.infer<typeof assetSelectionSchema>;

interface AssetSelectionStepProps {
  onSuccess?: () => void;
}

export function AssetSelectionStep({ onSuccess }: AssetSelectionStepProps) {
  const { t } = useTranslation(["onboarding", "general", "tokens"]);

  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
  );

  const form = useForm<AssetSelectionFormValues>({
    resolver: zodResolver(assetSelectionSchema),
    defaultValues: {
      assets: [],
    },
  });

  const { mutate: createFactories, isTracking: isPending } =
    useStreamingMutation({
      mutationOptions: orpc.tokens.factoryCreate.mutationOptions(),
      onSuccess: () => {
        toast.success(t("assets.deployed"));
        void queryClient.invalidateQueries({
          queryKey: orpc.system.read.key(),
        });
        onSuccess?.();
      },
    });

  const onSubmit = (values: AssetSelectionFormValues) => {
    if (!systemAddress?.value) {
      toast.error(t("assets.no-system"));
      return;
    }

    const factories = values.assets.map((assetType) => ({
      type: assetType,
      name: `${assetType.charAt(0).toUpperCase() + assetType.slice(1)} Factory`,
    }));

    createFactories({
      contract: systemAddress.value,
      factories,
    });
  };

  // Use all available token types from the enum
  const availableAssets = TokenTypeEnum.options;

  const watchedAssets = form.watch("assets");
  const isSubmitDisabled =
    !systemAddress?.value || watchedAssets.length === 0 || isPending;

  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sm-graphics-tertiary/20">
          <Package className="h-6 w-6 text-sm-graphics-tertiary" />
        </div>
        <CardTitle>{t("assets.title")}</CardTitle>
        <CardDescription>{t("assets.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">{t("assets.info")}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="assets"
              render={() => (
                <FormItem>
                  <FormLabel>{t("assets.select-label")}</FormLabel>
                  <FormDescription>
                    {t("assets.select-description")}
                  </FormDescription>
                  <div className="grid gap-3">
                    {availableAssets.map((assetType) => (
                      <FormField
                        key={assetType}
                        control={form.control}
                        name="assets"
                        render={({ field }) => (
                          <FormItem
                            key={assetType}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes(assetType)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, assetType]);
                                  } else {
                                    field.onChange(
                                      field.value.filter(
                                        (value) => value !== assetType
                                      )
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">
                                {t(`asset-types.${assetType}`, {
                                  ns: "tokens",
                                })}
                              </FormLabel>
                              <p className="text-sm text-muted-foreground">
                                {t(`assets.descriptions.${assetType}`)}
                              </p>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full"
            >
              {isPending ? t("general:deploying") : t("assets.deploy")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
