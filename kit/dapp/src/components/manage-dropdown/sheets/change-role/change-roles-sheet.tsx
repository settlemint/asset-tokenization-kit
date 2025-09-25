import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppForm } from "@/hooks/use-app-form";
import { getAccessControlEntries } from "@/orpc/helpers/access-control-helpers";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type {
  AccessControl,
  AccessControlRoles,
} from "@atk/zod/access-control-roles";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import type { RoleRequirement } from "@atk/zod/role-requirement";
import { CheckSquare, Shield } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ActionFormSheet } from "../../core/action-form-sheet";
import { createActionFormStore } from "../../core/action-form-sheet.store";

type OnRevokeOrGrantRole = (args: {
  accountAddress: EthereumAddress;
  walletVerification: UserVerification;
  roles: AccessControlRoles[];
}) => Promise<void>;

export interface RoleInfo {
  role: AccessControlRoles;
  label: string;
  description: string;
}

export interface GroupedRoles {
  label: string;
  roles: RoleInfo[];
}

export interface ChangeRolesSheetProps {
  open: boolean;
  accessControl: AccessControl | undefined;
  onOpenChange: (open: boolean) => void;
  asset?: Token;
  presetAccount?: EthereumAddress;
  groupedRoles: Map<string, GroupedRoles>;
  revokeRole: OnRevokeOrGrantRole;
  grantRole: OnRevokeOrGrantRole;
}

export function ChangeRolesSheet({
  open,
  accessControl,
  onOpenChange,
  asset,
  presetAccount,
  groupedRoles,
  revokeRole,
  grantRole,
}: ChangeRolesSheetProps) {
  const { t } = useTranslation(["common", "components"]);

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
    for (const [role, accounts] of getAccessControlEntries(accessControl)) {
      for (const acc of accounts) {
        const arr = index.get(acc.id) ?? [];
        arr.push(role);
        index.set(acc.id, arr);
      }
    }
    return index;
  }, [accessControl]);

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

  const renderRoleButton = (role: RoleInfo, addr: string) => {
    const currentSelected = addr
      ? (selectionOverrides.get(addr) ?? currentRolesForAddress(addr))
      : [];
    const checked = currentSelected.includes(role.role);
    return (
      <Tooltip key={role.role}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={checked ? "default" : "outline"}
            className="w-full"
            onClick={() => {
              toggleRole(addr, role.role);
            }}
          >
            <div className="flex w-full items-center justify-between">
              <span className="inline-flex items-center gap-2 overflow-hidden">
                <Shield className="h-4 w-4" />
                <span className="truncate">{role.label}</span>
              </span>

              {checked ? (
                <CheckSquare
                  className="h-4 w-4 opacity-90"
                  aria-label="selected"
                />
              ) : (
                <span aria-hidden className="h-4 w-4" />
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{role.description}</TooltipContent>
      </Tooltip>
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
            title={t("components:changeRolesSheet.title")}
            description={t("components:changeRolesSheet.description")}
            submitLabel={t("common:save")}
            hasValuesStep={true}
            canContinue={() => Boolean(selectedAddress && hasChanges)}
            store={sheetStoreRef.current}
            confirm={
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("components:changeRolesSheet.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {t("components:changeRolesSheet.accountLabel")}
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
                              <Badge key={`grant-${r}`}>
                                {t(
                                  `common:roles.${r.toLowerCase() as Lowercase<AccessControlRoles>}.title`
                                )}
                              </Badge>
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
                              <Badge key={`revoke-${r}`}>
                                {t(
                                  `common:roles.${r.toLowerCase() as Lowercase<AccessControlRoles>}.title`
                                )}
                              </Badge>
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
                    walletVerification: verification,
                    accountAddress: address,
                    roles: rolesToRevoke,
                  });
                }
                if (rolesToGrant.length > 0) {
                  await grantRole({
                    walletVerification: verification,
                    accountAddress: address,
                    roles: rolesToGrant,
                  });
                }
              })();

              toast.promise(promise, {
                loading: t("common:saving"),
                success: t("common:saved"),
                error: (data) => t("common:error", { message: data.message }),
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
                    {t("components:changeRolesSheet.accountLabel")}
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
                                  "components:changeRolesSheet.accountLabel"
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
                                  "components:changeRolesSheet.accountLabel"
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
                      {t("components:changeRolesSheet.rolesLabel")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {[...groupedRoles.entries()]
                      .filter(([_, { roles }]) => roles.length > 0)
                      .map(([groupName, { roles, label }]) => (
                        <div key={groupName} className="mb-4 last:mb-0">
                          <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                            {label}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {roles.map((role) =>
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

export function deriveAssignableRoles(
  reqs: Record<string, RoleRequirement>
): AccessControlRoles[] {
  const set = new Set<AccessControlRoles>();
  const collect = (r?: RoleRequirement) => {
    if (!r) return;
    if (typeof r === "string") {
      set.add(r);
      return;
    }
    if ("any" in r)
      r.any.forEach((element) => {
        collect(element);
      });
    else if ("all" in r)
      r.all.forEach((element) => {
        collect(element);
      });
  };
  Object.values(reqs).forEach((element) => {
    collect(element);
  });
  return [...set];
}

export function mergeRoles(
  assignable: AccessControlRoles[],
  existing?: Record<AccessControlRoles, unknown>
): AccessControlRoles[] {
  const fromExisting = existing
    ? (Object.keys(existing).filter((k) => {
        const value = existing[k as AccessControlRoles];
        return Array.isArray(value) && value.length > 0;
      }) as AccessControlRoles[])
    : [];
  return [...new Set([...assignable, ...fromExisting])];
}
