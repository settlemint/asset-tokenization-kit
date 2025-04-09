import { PincodeInput } from "@/components/blocks/auth/pincode/pincode-input";
import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth/client";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PasswordDialog } from "../password-dialog";

interface PincodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUpdate?: boolean;
}

// TypeBox schema for the pincode form
const pincodeSchema = t.Object(
  {
    pincode: t.Pincode(),
  },
  { $id: "PincodeForm" }
);

type PincodeFormValues = StaticDecode<typeof pincodeSchema>;

export function SetPincodeDialog({
  open,
  onOpenChange,
  isUpdate = false,
}: PincodeDialogProps) {
  const { data: session } = authClient.useSession();
  const t = useTranslations("private.auth.wallet-security.set-pincode-dialog");

  const form = useForm<PincodeFormValues>({
    resolver: typeboxResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
    },
  });
  const [password, setPassword] = useState("");

  const onSubmit = async (data: PincodeFormValues) => {
    try {
      if (isUpdate) {
        const { error } = await authClient.pincode.update({
          newPincode: data.pincode,
          password,
        });
        if (error) {
          throw new Error(error.message);
        }
        toast.success(t("update.pincode-update"));
      } else {
        const { error } = await authClient.pincode.enable({
          pincode: data.pincode,
          password,
        });
        if (error) {
          throw new Error(error.message);
        }
        toast.success(t("enable.pincode-set"));
      }
      setPassword("");
      form.reset();
      onOpenChange(false);
    } catch (err) {
      const error = err as Error;
      console.error("Failed to set pincode:", error);
      toast.error(
        isUpdate
          ? t("update.pincode-update-error", { error: error.message })
          : t("enable.pincode-set-error", { error: error.message })
      );
    }
  };
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isUpdate ? t("update.title") : t("enable.title")}
            </DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("pincode-label")}</FormLabel>
                    <FormControl>
                      <PincodeInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <TranslatableFormFieldMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? isUpdate
                      ? t("update.setting-up")
                      : t("enable.setting-up")
                    : isUpdate
                      ? t("update.submit")
                      : t("enable.submit")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <PasswordDialog
        open={!password && (session?.user.initialOnboardingFinished ?? false)}
        onOpenChange={onOpenChange}
        onSubmit={async (password) => {
          setPassword(password);
          return Promise.resolve();
        }}
        isLoading={form.formState.isSubmitting}
        submitButtonText={t("password-submit")}
        submitButtonVariant={isUpdate ? "destructive" : "default"}
        description={t("password-description")}
      />
    </>
  );
}
