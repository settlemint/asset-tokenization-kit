import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { ActionFormSheet } from "../core/action-form-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { getAccessControlEntries } from "@/orpc/helpers/access-control-helpers";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, CheckSquare } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import {
  isAnyRoleRequirement,
  isAllRoleRequirement,
  isSingleRole,
} from "@/lib/zod/validators/role-requirement";
import type { RoleRequirement } from "@/lib/zod/validators/role-requirement";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { createActionFormStore } from "../core/action-form-sheet.store";
import { toast } from "sonner";

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
      walletVerification: undefined as
        | {
            secretVerificationCode: string;
            verificationType?: "PINCODE" | "SECRET_CODES" | "OTP";
          }
        | undefined,
    },
    onSubmit: () => {},
  });

  // Compute current roles per address from token access control
  const rolesIndex = useMemo(() => {
    const index = new Map<string, AccessControlRoles[]>();
    for (const [role, accounts] of getAccessControlEntries(
      asset.accessControl
    )) {
      for (const acc of accounts) {
        const arr = index.get(acc.id) ?? [];
        arr.push(role);
        index.set(acc.id, arr);
      }
    }
    return index;
  }, [asset.accessControl]);

  const currentRolesForAddress = (addr: string): AccessControlRoles[] => {
    const roles =
      rolesIndex.get(addr.toLowerCase()) || rolesIndex.get(addr) || [];
    return roles;
  };

  // Per-address selection overrides (derived default = current roles)
  const [selectionOverrides, setSelectionOverrides] = useState<
    Map<string, AccessControlRoles[]>
  >(new Map());

  const toggleRole = (addr: string, role: AccessControlRoles) => {
    if (!addr) return;
    setSelectionOverrides((prev) => {
      const next = new Map(prev);
      const base = next.get(addr) ?? currentRolesForAddress(addr);
      const has = base.includes(role);
      const updated = has ? base.filter((r) => r !== role) : [...base, role];
      next.set(addr, updated);
      return next;
    });
  };

  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  const handleClose = () => {
    form.reset();
    setSelectionOverrides(new Map());
    // Reset step to values for next open
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };

  // No effects needed: we derive current selection from overrides or current roles

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

  const renderRoleButton = (role: AccessControlRoles, addr: string) => {
    const currentSelected = addr
      ? (selectionOverrides.get(addr) ?? currentRolesForAddress(addr))
      : [];
    const checked = currentSelected.includes(role);
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
        className="w-full"
        onClick={() => {
          toggleRole(addr, role);
        }}
      >
        <div className="flex w-full items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <Shield className="h-4 w-4" /> {label}
          </span>
          {checked ? (
            <CheckSquare className="h-4 w-4 opacity-90" aria-label="selected" />
          ) : (
            <span aria-hidden className="h-4 w-4" />
          )}
        </div>
      </Button>
    );
  };

  return (
    <form.Subscribe selector={(s) => ({ address: s.values.address })}>
      {({ address }) => {
        const selectedAddress = address || presetAccount || "";
        const currentForSelected = selectedAddress
          ? currentRolesForAddress(selectedAddress)
          : [];
        const derivedSelected = selectedAddress
          ? (selectionOverrides.get(selectedAddress) ??
            currentRolesForAddress(selectedAddress))
          : [];
        const hasChanges = (() => {
          if (!selectedAddress) return false;
          const a = new Set(derivedSelected);
          const b = new Set(currentForSelected);
          if (a.size !== b.size) return true;
          for (const r of a) if (!b.has(r)) return true;
          return false;
        })();

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={(next) => {
              if (!next) {
                // Reset when closing via external close
                form.reset();
                setSelectionOverrides(new Map());
                sheetStoreRef.current.setState((s) => ({
                  ...s,
                  step: "values",
                }));
              }
              onOpenChange(next);
            }}
            asset={asset}
            title={t("tokens:permissions.changeRoles.title")}
            description={t("tokens:permissions.changeRoles.description")}
            submitLabel={t("common:save")}
            hasValuesStep={true}
            canContinue={() => Boolean(selectedAddress && hasChanges)}
            store={sheetStoreRef.current}
            confirm={
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("tokens:permissions.changeRoles.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {t("tokens:actions.grantRole.form.accountLabel")}
                    </div>
                    <div className="text-sm font-medium">{selectedAddress}</div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          {t("common:add")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {derivedSelected
                            .filter((r) => !currentForSelected.includes(r))
                            .map((r) => (
                              <Badge key={`grant-${r}`}>{r}</Badge>
                            ))}
                          {derivedSelected.filter(
                            (r) => !currentForSelected.includes(r)
                          ).length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              {t("common:none")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          {t("common:remove")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentForSelected
                            .filter((r) => !derivedSelected.includes(r))
                            .map((r) => (
                              <Badge key={`revoke-${r}`}>{r}</Badge>
                            ))}
                          {currentForSelected.filter(
                            (r) => !derivedSelected.includes(r)
                          ).length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              {t("common:none")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
            disabled={() => !selectedAddress || !hasChanges}
            onSubmit={async (verification) => {
              const address = selectedAddress as EthereumAddress;
              if (!address) return;
              const selectedSet = new Set(derivedSelected);
              const currentSet = new Set(currentForSelected);
              const rolesToGrant = [...selectedSet].filter(
                (r) => !currentSet.has(r)
              );
              const rolesToRevoke = [...currentSet].filter(
                (r) => !selectedSet.has(r)
              );

              const promise = (async () => {
                if (rolesToRevoke.length > 0) {
                  await revokeRole({
                    contract: asset.id,
                    walletVerification: verification,
                    address,
                    role: rolesToRevoke,
                  });
                }
                if (rolesToGrant.length > 0) {
                  await grantRole({
                    contract: asset.id,
                    walletVerification: verification,
                    address,
                    roles: rolesToGrant,
                  });
                }
                await queryClient.invalidateQueries({
                  queryKey: orpc.token.read.queryOptions({
                    input: { tokenAddress: asset.id },
                  }).queryKey,
                });
              })();

              toast.promise(promise, {
                loading: t("common:saving"),
                success: t("common:saved"),
                error: t("common:error"),
              });

              await promise;
              handleClose();
            }}
          >
            <div className="space-y-4">
              {/* Selection derived from overrides or current roles for address */}
              {/* Address Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("tokens:actions.grantRole.form.accountLabel")}
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
                                label={t(
                                  "tokens:actions.grantRole.form.accountLabel"
                                )}
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
                                label={t(
                                  "tokens:actions.grantRole.form.accountLabel"
                                )}
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

              {/* Roles Selection (hidden until address chosen) */}
              {selectedAddress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t("tokens:permissions.columns.roles")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(
                      [
                        "Administration",
                        "Operations",
                        "Compliance",
                        "Other",
                      ] as const
                    )
                      .filter((group) => groupedRoles.get(group)?.length)
                      .map((group) => (
                        <div key={group} className="mb-4 last:mb-0">
                          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                            {t(
                              `tokens:permissions.groups.${group.toLowerCase() as Lowercase<typeof group>}` as const
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {groupedRoles
                              .get(group)
                              ?.map((role) =>
                                renderRoleButton(role, selectedAddress)
                              )}
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
