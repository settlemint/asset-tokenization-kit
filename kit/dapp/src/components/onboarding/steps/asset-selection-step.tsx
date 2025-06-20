import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { queryClient } from "@/lib/query.client";
import { orpc } from "@/orpc";
import { TokenTypeEnum } from "@/orpc/routes/tokens/routes/factory.create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Building,
  Coins,
  Package,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
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
  onRegisterAction?: (action: () => void) => void;
}

// Asset type icon mapping
const assetIcons = {
  bond: Building,
  equity: BarChart3,
  fund: PiggyBank,
  stablecoin: Coins,
  deposit: Wallet,
};

export function AssetSelectionStep({
  onSuccess,
  onRegisterAction,
}: AssetSelectionStepProps) {
  const { t } = useTranslation(["onboarding", "general", "tokens"]);

  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
  );

  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress?.value ?? "" },
    }),
    enabled: !!systemAddress?.value,
  });

  const form = useForm<AssetSelectionFormValues>({
    resolver: zodResolver(assetSelectionSchema),
    defaultValues: {
      assets: [],
    },
  });

  const { mutate: createFactories } = useStreamingMutation({
    mutationOptions: orpc.tokens.factoryCreate.mutationOptions(),
    onSuccess: async () => {
      toast.success(t("assets.deployed"));
      await queryClient.invalidateQueries({
        queryKey: orpc.system.read.key(),
      });
      await queryClient.invalidateQueries({
        queryKey: orpc.system.read.queryOptions({
          input: { id: systemAddress?.value ?? "" },
        }).queryKey,
        refetchType: "all",
      });
      onSuccess?.();
    },
  });

  const handleDeployFactories = () => {
    if (!systemAddress?.value) {
      toast.error(t("assets.no-system"));
      return;
    }

    const values = form.getValues();
    if (values.assets.length === 0) {
      void form.trigger("assets");
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

  const hasDeployedAssets = (systemDetails?.tokenFactories.length ?? 0) > 0;

  // Register the action with parent
  useEffect(() => {
    if (onRegisterAction && !hasDeployedAssets) {
      onRegisterAction(handleDeployFactories);
    }
  }, [onRegisterAction, hasDeployedAssets, watchedAssets.length]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {hasDeployedAssets ? "Asset Types Deployed" : "Select Asset Types"}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {hasDeployedAssets
            ? "Your asset factories are ready for tokenization"
            : "Choose the types of assets you want to tokenize on your platform"}
        </p>
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={{ minHeight: "450px", maxHeight: "550px" }}
      >
        <div className="space-y-6 pr-2">
          {hasDeployedAssets ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium text-green-800 dark:text-green-300">
                    Asset Factories Deployed Successfully
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Deployed Factories
                  </p>
                  <div className="grid gap-2">
                    {systemDetails?.tokenFactories.map((factory) => {
                      const iconKey = factory.typeId as keyof typeof assetIcons;
                      const Icon =
                        iconKey in assetIcons ? assetIcons[iconKey] : Package;
                      return (
                        <div
                          key={factory.id}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{factory.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info box */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      What are asset factories?
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Asset factories are smart contracts that enable you to
                      create and manage different types of tokenized assets.
                      Each factory handles a specific asset class with tailored
                      features and compliance requirements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Asset selection form */}
              <Form {...form}>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="assets"
                    render={() => (
                      <FormItem>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                              Available Asset Types
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Select all the asset types you plan to tokenize
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {availableAssets.map((assetType) => {
                              const iconKey = assetType;
                              const Icon =
                                iconKey in assetIcons
                                  ? assetIcons[iconKey]
                                  : Package;
                              return (
                                <FormField
                                  key={assetType}
                                  control={form.control}
                                  name="assets"
                                  render={({ field }) => (
                                    <FormItem
                                      key={assetType}
                                      className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value.includes(
                                            assetType
                                          )}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
                                              field.onChange([
                                                ...field.value,
                                                assetType,
                                              ]);
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
                                      <div className="flex-1 space-y-1 leading-none">
                                        <div className="flex items-center gap-2">
                                          <Icon className="h-4 w-4 text-muted-foreground" />
                                          <FormLabel className="text-sm font-medium cursor-pointer">
                                            {t(`asset-types.${assetType}`, {
                                              ns: "tokens",
                                            })}
                                          </FormLabel>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          {t(
                                            `assets.descriptions.${assetType}`
                                          )}
                                        </p>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Validation message */}
                  {form.formState.errors.assets && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {form.formState.errors.assets.message}
                    </p>
                  )}
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
