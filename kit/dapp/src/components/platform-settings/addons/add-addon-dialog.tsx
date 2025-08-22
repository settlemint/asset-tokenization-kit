import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form/tanstack-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import { 
  type SystemAddonCreateInput,
  SystemAddonCreateSchema 
} from "@/orpc/routes/system/addon/routes/addon.create.schema";
import { addonTypes } from "@atk/zod/addon-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getAddonIcon } from "@/components/onboarding/system-addons/addon-icons";

interface AddAddonDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Dialog for adding new system addons
 * Allows users to select addon type and configure basic settings
 */
export function AddAddonDialog({ isOpen, onClose }: AddAddonDialogProps) {
  const { t } = useTranslation(["platform-settings", "onboarding"]);
  const queryClient = useQueryClient();

  const form = useAppForm({
    defaultValues: {
      addons: {
        type: "airdrops" as const,
        name: "",
      },
    } as SystemAddonCreateInput,
    onSubmit: ({ value }) => {
      const parsedValues = SystemAddonCreateSchema.parse(value);
      
      toast.promise(createAddon(parsedValues), {
        loading: t("platform-settings:addons.dialogs.add.deploying"),
        success: () => {
          onClose();
          form.reset();
          return t("platform-settings:addons.dialogs.add.success");
        },
        error: (error: Error) =>
          `${t("platform-settings:addons.dialogs.add.error")}: ${error.message}`,
      });
    },
  });

  const { mutateAsync: createAddon, isPending } = useMutation(
    orpc.system.addonCreate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.system.addonList.key() });
      },
    })
  );

  const getAddonDescription = (type: string) => {
    return t(`onboarding:system-addons.addon-selection.addon-types.${type}.description`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form.AppForm>
          <DialogHeader>
            <DialogTitle>{t("platform-settings:addons.dialogs.add.title")}</DialogTitle>
            <DialogDescription>
              {t("platform-settings:addons.dialogs.add.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <form.Field name="addons.type">
              {(field) => (
                <FormItem>
                  <FormLabel>{t("platform-settings:addons.dialogs.add.fields.type.label")}</FormLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("platform-settings:addons.dialogs.add.fields.type.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {addonTypes.map((type) => {
                        const Icon = getAddonIcon(type);
                        return (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span>
                                {t(`onboarding:system-addons.addon-selection.addon-types.${type}.title`)}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.state.value && getAddonDescription(field.state.value)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            </form.Field>

            <form.Field
              name="addons.name"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return t("platform-settings:addons.dialogs.add.fields.name.required");
                  }
                  if (value.length < 3) {
                    return t("platform-settings:addons.dialogs.add.fields.name.minLength");
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <FormItem>
                  <FormLabel>{t("platform-settings:addons.dialogs.add.fields.name.label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field.getInputProps()}
                      placeholder={t("platform-settings:addons.dialogs.add.fields.name.placeholder")}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("platform-settings:addons.dialogs.add.fields.name.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            </form.Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              {t("platform-settings:common.cancel")}
            </Button>
            <form.VerificationButton
              onSubmit={() => {
                void form.handleSubmit();
              }}
              disabled={isPending}
              walletVerification={{
                title: t("platform-settings:addons.dialogs.add.verification.title"),
                description: t("platform-settings:addons.dialogs.add.verification.description"),
                setField: (verification) => {
                  form.setFieldValue("walletVerification", verification);
                },
              }}
            >
              {isPending
                ? t("platform-settings:addons.dialogs.add.deploying")
                : t("platform-settings:addons.dialogs.add.deploy")}
            </form.VerificationButton>
          </DialogFooter>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
}