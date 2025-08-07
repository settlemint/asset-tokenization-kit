import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { ArrayFieldsLayout } from "@/components/layout/array-fields-layout";
import { BaseActionSheet } from "@/components/manage-dropdown/base-action-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { assetAccessControlRoles } from "@/lib/zod/validators/access-control-roles";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { orpc } from "@/orpc/orpc-client";
import {
  TokenGrantRoleInput,
  TokenGrantRoleInputSchema,
} from "@/orpc/routes/token/routes/mutations/access/token.grant-role.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface GrantRoleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
}

export function GrantRoleSheet({
  open,
  onOpenChange,
  asset,
}: GrantRoleSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const queryClient = useQueryClient();
  const { mutateAsync: grantRole, isPending: isGrantingRole } = useMutation(
    orpc.token.grantRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.token.read.queryOptions({
            input: { tokenAddress: asset.id },
          }).queryKey,
        });
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      accounts: [] as string[],
      contract: asset.id,
    } as TokenGrantRoleInput,
    onSubmit: (value) => {
      const parsedValues = TokenGrantRoleInputSchema.parse(value.value);
      toast.promise(grantRole(parsedValues), {
        loading: t("actions.grantRole.messages.submitting"),
        success: t("actions.grantRole.messages.success", {
          role: parsedValues.role,
        }),
        error: t("actions.grantRole.messages.error"),
      });
      handleClose();
    },
  });

  const roleOptions = assetAccessControlRoles.map((role) => ({
    value: role,
    label:
      role.charAt(0).toUpperCase() +
      role
        .slice(1)
        .replaceAll(/([A-Z])/g, " $1")
        .trim(),
    description: t("actions.grantRole.form.roleOptionDescription", { role }),
    icon: Shield,
  }));

  const handleClose = useCallback(() => {
    form.reset();

    onOpenChange(false);
  }, [form, onOpenChange]);

  const handleCancel = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <form.AppForm>
      <BaseActionSheet
        open={open}
        onOpenChange={onOpenChange}
        asset={asset}
        title={t("tokens:actions.grantRole.title")}
        description={t("tokens:actions.grantRole.description")}
        submit={
          <form.VerificationButton
            verification={{
              title: t("tokens:actions.grantRole.title"),
              description: t("tokens:actions.grantRole.description"),
              setField: (verification) => {
                form.setFieldValue("verification", verification);
              },
            }}
            onSubmit={() => {
              void form.handleSubmit();
            }}
            disabled={isGrantingRole}
          >
            {isGrantingRole
              ? t("actions.grantRole.submitting")
              : t("actions.grantRole.submit")}
          </form.VerificationButton>
        }
        onCancel={handleCancel}
        isSubmitting={isGrantingRole}
      >
        <div className="space-y-4">
          {/* Role Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:actions.grantRole.form.selectRoleTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form.AppField
                name="role"
                children={(field) => (
                  <field.RadioField
                    label=""
                    options={roleOptions}
                    variant="card"
                    className="grid grid-cols-2 gap-4"
                    required
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* Accounts Field Card - Empty for now */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:actions.grantRole.form.targetAccountsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form.Field
                name="accounts"
                mode="array"
                children={(field) => {
                  return (
                    <ArrayFieldsLayout
                      values={field.state.value}
                      onAdd={() => {
                        field.pushValue("" as EthereumAddress);
                      }}
                      onRemove={(_, index) => {
                        field.removeValue(index);
                      }}
                      component={(_address, index) => (
                        <AddressSelectOrInputToggle>
                          {({ mode }) => (
                            <>
                              {mode === "select" && (
                                <form.AppField
                                  name={`accounts[${index}]`}
                                  children={(field) => (
                                    <field.AddressSelectField
                                      scope="user"
                                      label={t(
                                        "tokens:actions.grantRole.form.accountLabel"
                                      )}
                                      required={true}
                                    />
                                  )}
                                />
                              )}
                              {mode === "manual" && (
                                <form.AppField
                                  name={`accounts[${index}]`}
                                  children={(field) => (
                                    <field.AddressInputField
                                      label={t(
                                        "tokens:actions.grantRole.form.accountLabel"
                                      )}
                                      required={true}
                                    />
                                  )}
                                />
                              )}
                            </>
                          )}
                        </AddressSelectOrInputToggle>
                      )}
                      addButtonLabel={t(
                        "tokens:actions.grantRole.form.addAccount"
                      )}
                    />
                  );
                }}
              />
            </CardContent>
          </Card>
        </div>
      </BaseActionSheet>
    </form.AppForm>
  );
}
