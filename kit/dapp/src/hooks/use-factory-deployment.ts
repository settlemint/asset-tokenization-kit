import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import {
  type FactoryCreateInput,
  FactoryCreateSchema,
} from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function useFactoryDeployment(systemAddress?: string | null) {
  const { t } = useTranslation(["onboarding"]);
  const queryClient = useQueryClient();

  const form = useAppForm({
    defaultValues: {
      factories: [] as FactoryCreateInput["factories"],
      walletVerification: {
        secretVerificationCode: "",
        verificationType: "PINCODE" as const,
      },
    } as FactoryCreateInput,
    onSubmit: ({ value }) => {
      if (!systemAddress) {
        toast.error(t("assets.no-system"));
        return;
      }
      const parsedValues = FactoryCreateSchema.parse(value);

      toast.promise(createFactories(parsedValues), {
        loading: t("assets.deploying-toast"),
        success: t("assets.deployed"),
        error: (error: Error) => `${t("assets.failed-toast")}${error.message}`,
      });
    },
  });

  const { mutateAsync: createFactories, isPending: isDeploying } = useMutation(
    orpc.system.factory.create.mutationOptions({
      onSuccess: async () => {
        // Refetch system data
        await queryClient.invalidateQueries({
          queryKey: orpc.system.read.key(),
        });
        // Clear selection
        form.setFieldValue("factories", []);
      },
    })
  );

  return {
    form,
    isDeploying,
    createFactories,
  };
}
