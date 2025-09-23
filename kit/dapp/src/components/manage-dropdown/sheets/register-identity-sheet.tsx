import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { useCountries } from "@/hooks/use-countries";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { isoCountryCode } from "@atk/zod/iso-country-code";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

const RegisterIdentityFormSchema = z.object({
  country: isoCountryCode,
});

const normalizeCountryCode = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim().toUpperCase();
};

interface RegisterIdentitySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  identity: {
    identity: string;
    account: {
      id: string;
      contractName?: string | null;
    };
    isRegistered: boolean;
  };
}

export function RegisterIdentitySheet({
  open,
  onOpenChange,
  identity,
}: RegisterIdentitySheetProps) {
  const { t } = useTranslation("identities");
  const { t: tCommon } = useTranslation("common");
  const queryClient = useQueryClient();
  const router = useRouter();
  const { getCountryOptions } = useCountries();
  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));
  const ownerWallet = useMemo(
    () => getEthereumAddress(identity.account.id),
    [identity.account.id]
  );

  const form = useAppForm({
    defaultValues: {
      country: "",
      verification: undefined,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (open) {
      form.reset({
        country: "",
        verification: undefined,
      });
      sheetStoreRef.current.setState((state) => ({ ...state, step: "values" }));
    }
  }, [open, form]);

  const { mutateAsync: registerIdentity, isPending } = useMutation(
    orpc.system.identity.register.mutationOptions({
      onSuccess: async (_, variables) => {
        const resolvedWallet = variables.wallet ?? identity.account.id;
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.system.identity.read.queryKey({
              input: { identityId: identity.identity },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.system.identity.read.queryKey({
              input: { wallet: resolvedWallet },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.system.read.queryKey({ input: { id: "default" } }),
          }),
        ]);
        await router.invalidate();
      },
    })
  );

  const countryOptions = useMemo(
    () => getCountryOptions("alpha2"),
    [getCountryOptions]
  );

  const handleSubmit = (verification: UserVerification) => {
    const formCountry = normalizeCountryCode(
      form.getFieldValue("country") as string | undefined
    );
    const parseResult = RegisterIdentityFormSchema.safeParse({
      country: formCountry || undefined,
    });

    if (!parseResult.success) {
      toast.error(parseResult.error.message);
      return;
    }

    const { country } = parseResult.data;
    const resolvedWallet = ownerWallet;

    const action = registerIdentity({
      country,
      wallet: resolvedWallet,
      walletVerification: verification,
    }).then(() => {
      sheetStoreRef.current.setState((state) => ({
        ...state,
        step: "values",
      }));
      onOpenChange(false);
    });

    toast.promise(action, {
      loading: tCommon("deploying"),
      success: t("register.success"),
      error: (error: Error) => error.message,
    });
  };

  return (
    <form.Subscribe selector={(state) => state.values.country}>
      {(selectedCountry) => {
        const normalizedCountry = normalizeCountryCode(selectedCountry);
        const canContinue = RegisterIdentityFormSchema.safeParse({
          country: normalizedCountry || undefined,
        }).success;
        const displayCountry = normalizedCountry
          ? (countryOptions.find((option) => option.value === normalizedCountry)
              ?.label ?? normalizedCountry)
          : tCommon("none");

        const confirmView = (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("register.confirm.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">
                  {t("register.form.country")}
                </span>
                <span className="font-medium">{displayCountry}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs uppercase tracking-wide">
                  {t("register.form.walletAddress")}
                </span>
                <span className="font-mono text-xs break-all">
                  {ownerWallet}
                </span>
              </div>
              <p className="text-muted-foreground text-xs">
                {t("register.confirm.description")}
              </p>
            </CardContent>
          </Card>
        );

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                sheetStoreRef.current.setState((state) => ({
                  ...state,
                  step: "values",
                }));
              }
              onOpenChange(nextOpen);
            }}
            title={t("actions.registerIdentity.title")}
            description={t("actions.registerIdentity.description")}
            submitLabel={t("actions.registerIdentity.label")}
            isSubmitting={isPending}
            disabled={() => isPending}
            canContinue={() => canContinue}
            onSubmit={handleSubmit}
            store={sheetStoreRef.current}
            showAssetDetailsOnConfirm={false}
            confirm={confirmView}
          >
            <form.AppField name="country">
              {(field) => (
                <field.CountrySelectField
                  label={t("register.form.country")}
                  description={t("register.form.countryInfo")}
                  valueType="alpha2"
                  required
                />
              )}
            </form.AppField>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
