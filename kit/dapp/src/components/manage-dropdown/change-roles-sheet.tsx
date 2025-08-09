import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { BaseActionSheet } from "@/components/manage-dropdown/base-action-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { getAccessControlEntries } from "@/orpc/helpers/access-control-helpers";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import { isAnyRoleRequirement, isAllRoleRequirement, isSingleRole } from "@/lib/zod/validators/role-requirement";
import type { RoleRequirement } from "@/lib/zod/validators/role-requirement";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

interface ChangeRolesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
  presetAccount?: EthereumAddress;
}

export function ChangeRolesSheet({
  open,
  onOpenChange,
  asset,
  presetAccount,
}: ChangeRolesSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const queryClient = useQueryClient();

  const { mutateAsync: grantRole } = useMutation(
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
  const { mutateAsync: revokeRole } = useMutation(
    orpc.token.revokeRole.mutationOptions({
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
      address: (presetAccount as string | undefined) ?? "",
      verification: undefined as
        | { verificationCode: string; verificationType?: "pincode" | "secret-code" | "two-factor" }
        | undefined,
    },
    onSubmit: async (value) => {
      const address = value.value.address as EthereumAddress;
      if (!address) return;
      const currentlyHas = currentRolesForAddress(address);
      const selected = new Set(selectedRoles);
      const current = new Set(currentlyHas);

      const rolesToGrant = [...selected].filter((r) => !current.has(r));
      const rolesToRevoke = [...current].filter((r) => !selected.has(r));

      // Perform revoke first, then grant
      const verification = form.getFieldValue("verification");
      if (rolesToRevoke.length > 0 && verification) {
        await revokeRole({
          contract: asset.id,
          verification,
          address,
          role: rolesToRevoke,
        });
      }

      if (rolesToGrant.length > 0 && verification) {
        await grantRole({
          contract: asset.id,
          verification,
          address,
          roles: rolesToGrant,
        } as unknown as Parameters<typeof grantRole>[0]);
      }

      handleClose();
    },
  });

  // Compute current roles per address from token access control
  const rolesIndex = useMemo(() => {
    const index = new Map<string, AccessControlRoles[]>();
    for (const [role, accounts] of getAccessControlEntries(asset.accessControl)) {
      for (const acc of accounts) {
        const arr = index.get(acc.id) ?? [];
        arr.push(role);
        index.set(acc.id, arr);
      }
    }
    return index;
  }, [asset.accessControl]);

  const currentRolesForAddress = (addr: string): AccessControlRoles[] => {
    const roles = rolesIndex.get(addr.toLowerCase()) || rolesIndex.get(addr) || [];
    return roles;
  };

  const [selectedRoles, setSelectedRoles] = useState<AccessControlRoles[]>([]);

  // When opened or address changes, preselect roles the address currently has
  useEffect(() => {
    const address = (form.getFieldValue("address")) || presetAccount;
    if (presetAccount && form.getFieldValue("address") !== presetAccount) {
      form.setFieldValue("address", presetAccount);
    }
    if (address) {
      setSelectedRoles(currentRolesForAddress(address));
    } else {
      setSelectedRoles([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetAccount, rolesIndex]);

  const toggleRole = (role: AccessControlRoles) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  // Derive token-assignable roles from TOKEN_PERMISSIONS role requirements
  const tokenAssignableRoles = useMemo(() => {
    const set = new Set<AccessControlRoles>();
    const collect = (req: RoleRequirement) => {
      if (!req) return;
      if (isSingleRole(req)) {
        set.add(req);
        return;
      }
      if (isAnyRoleRequirement(req)) {
        for (const r of req.any) collect(r);
        return;
      }
      if (isAllRoleRequirement(req)) {
        for (const r of req.all) collect(r);
        return;
      }
    };
    Object.values(TOKEN_PERMISSIONS).forEach((req) => {
      collect(req);
    });
    return [...set.values()];
  }, []);

  const groupedRoles = useMemo(() => {
    const groupForRole = (role: AccessControlRoles) => {
      if (role === "admin" || role === "tokenManager") return "Administration";
      if (role === "governance") return "Compliance";
      if (
        role === "supplyManagement" ||
        role === "emergency" ||
        role === "custodian"
      )
        return "Operations";
      return "Other";
    };

    const map = new Map<string, AccessControlRoles[]>();
    tokenAssignableRoles.forEach((r) => {
      const g = groupForRole(r);
      const arr = map.get(g) ?? [];
      arr.push(r);
      map.set(g, arr);
    });
    return map;
  }, [tokenAssignableRoles]);

  const renderRoleButton = (role: AccessControlRoles) => {
    const checked = selectedRoles.includes(role);
    const label =
      role.charAt(0).toUpperCase() +
      role
        .slice(1)
        .replaceAll(/([A-Z])/g, " $1")
        .trim();
    return (
      <Button
        key={role}
        type="button"
        variant={checked ? "default" : "outline"}
        className="justify-start"
        onClick={() => { toggleRole(role); }}
      >
        <Shield className="mr-2 h-4 w-4" /> {label}
        {checked && (
          <Badge className="ml-2">
            {t("common:selected", { defaultValue: "Selected" })}
          </Badge>
        )}
      </Button>
    );
  };

  return (
    <form.AppForm>
      <BaseActionSheet
        open={open}
        onOpenChange={onOpenChange}
        asset={asset}
        title={t("tokens:permissions.changeRoles.title", { defaultValue: "Change roles" })}
        description={t("tokens:permissions.changeRoles.description", { defaultValue: "Assign or remove roles for this address" })}
        submit={
          <form.VerificationButton
            verification={{
              title: t("tokens:permissions.changeRoles.title", { defaultValue: "Change roles" }),
              description: t("tokens:permissions.changeRoles.description", { defaultValue: "Assign or remove roles for this address" }),
              setField: (verification) => {
                form.setFieldValue("verification", verification);
              },
            }}
            onSubmit={() => {
              void form.handleSubmit();
            }}
          >
            {t("common:save", { defaultValue: "Save" })}
          </form.VerificationButton>
        }
        onCancel={handleClose}
        isSubmitting={false}
      >
        <div className="space-y-4">
          {/* Address Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:actions.grantRole.form.accountLabel", { defaultValue: "Account" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddressSelectOrInputToggle>
                {({ mode }) => (
                  <>
                    {mode === "select" && (
                      <form.AppField
                        name="address"
                        children={(field) => (
                          <field.AddressSelectField
                            scope="user"
                            label={t("tokens:actions.grantRole.form.accountLabel")}
                            required
                          />
                        )}
                      />
                    )}
                    {mode === "manual" && (
                      <form.AppField
                        name="address"
                        children={(field) => (
                          <field.AddressInputField
                            label={t("tokens:actions.grantRole.form.accountLabel")}
                            required
                          />
                        )}
                      />
                    )}
                  </>
                )}
              </AddressSelectOrInputToggle>
            </CardContent>
          </Card>

          {/* Roles Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t("tokens:permissions.columns.roles", { defaultValue: "Roles" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(["Administration", "Operations", "Compliance", "Other"] as const)
                .filter((group) => groupedRoles.get(group)?.length)
                .map((group) => (
                  <div key={group} className="mb-4 last:mb-0">
                    <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                      {t(`tokens:permissions.groups.${group.toLowerCase()}`, {
                        defaultValue: group,
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {groupedRoles
                        .get(group)
                        ?.map((role) => renderRoleButton(role))}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </BaseActionSheet>
    </form.AppForm>
  );
}
