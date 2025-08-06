import { BaseActionSheet } from "@/components/manage-dropdown/base-action-sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { useAppForm } from "@/hooks/use-app-form";
import { assetAccessControlRoles } from "@/lib/zod/validators/access-control-roles";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import {
  TokenGrantRoleInput,
  TokenGrantRoleInputSchema,
} from "@/orpc/routes/token/routes/mutations/access/token.grant-role.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";

import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { ArrayFieldsLayout } from "@/components/layout/array-fields-layout";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { useCallback, useState } from "react";
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
  const queryClient = useQueryClient();
  const [showVerification, setShowVerification] = useState(false);

  const { mutateAsync: grantRole, isPending } = useMutation(
    orpc.token.grantRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.token.read.queryOptions({
            input: { tokenAddress: asset.id },
          }).queryKey,
        });
        toast.success("Role granted successfully");
        handleClose();
      },
      onError: (error) => {
        toast.error(`Failed to grant role: ${error.message}`);
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      accounts: [] as string[],
    } as TokenGrantRoleInput,
    onSubmit: (value) => {
      const parsedValues = TokenGrantRoleInputSchema.parse(value.value);
      toast.promise(grantRole(parsedValues), {
        loading: "Granting role...",
        success: "Role granted successfully",
        error: "Failed to grant role",
      });
      form.reset();
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
    description: `Grant ${role} permissions to the selected accounts`,
    icon: Shield,
  }));

  const handleClose = useCallback(() => {
    form.reset();
    setShowVerification(false);

    onOpenChange(false);
  }, [form, onOpenChange]);

  const handleCancel = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <>
      <BaseActionSheet
        open={open && !showVerification}
        onOpenChange={onOpenChange}
        asset={asset}
        title="Grant Role"
        description="Grant access control roles to specified accounts"
        onProceed={() => {
          setShowVerification(true);
        }}
        onCancel={handleCancel}
        submitLabel="Grant role"
        isSubmitting={isPending}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="space-y-4">
            {/* Role Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Role</CardTitle>
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
                <CardTitle className="text-base">Target Accounts</CardTitle>
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
                                        label="Account"
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
                                        label="Account"
                                        required={true}
                                      />
                                    )}
                                  />
                                )}
                              </>
                            )}
                          </AddressSelectOrInputToggle>
                        )}
                        addButtonLabel="Add account"
                      />
                    );
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </BaseActionSheet>

      {/* Verification Dialog */}
      {showVerification && (
        <VerificationDialog
          open={showVerification}
          onOpenChange={setShowVerification}
          title="Verify Transaction"
          description="Please verify your identity to grant the role"
          onSubmit={async (verification: UserVerification) => {
            form.setFieldValue("verification", verification);
            await form.validate("change");
            if (form.state.isValid) {
              await form.handleSubmit();
            }
          }}
          onCancel={() => {
            setShowVerification(false);
          }}
        />
      )}
    </>
  );
}
