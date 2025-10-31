import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { getEthereumAddress } from "@atk/zod/ethereum-address";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { isAddress } from "viem";
import { ActionFormSheet } from "../core/action-form-sheet";
import { createActionFormStore } from "../core/action-form-sheet.store";

type BlocklistActionMode = "add" | "remove";

interface BlocklistSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Token;
  presetAddress?: EthereumAddress;
  defaultMode?: BlocklistActionMode;
  onCompleted: (args: {
    address: EthereumAddress;
    mode: BlocklistActionMode;
  }) => void;
}

export function BlocklistSheet({
  open,
  onOpenChange,
  asset,
  presetAddress,
  defaultMode = "add",
  onCompleted,
}: BlocklistSheetProps) {
  const { t } = useTranslation(["tokens", "common"]);
  const queryClient = useQueryClient();
  const { mutateAsync: freezeAddress } = useMutation(
    orpc.token.freezeAddress.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.token.read.queryKey({
              input: { tokenAddress: asset.id },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.token.holders.queryKey({
              input: { tokenAddress: asset.id },
            }),
          }),
        ]);
      },
    })
  );
  const [mode, setMode] = useState<BlocklistActionMode>(defaultMode);

  const form = useAppForm({
    defaultValues: {
      address: (presetAddress as string | undefined) ?? "",
      walletVerification: undefined as
        | {
            secretVerificationCode: string;
            verificationType?: "PINCODE" | "SECRET_CODES" | "OTP";
          }
        | undefined,
    },
    onSubmit: () => {},
  });

  const sheetStoreRef = useRef(createActionFormStore({ hasValuesStep: true }));

  const resetAndClose = () => {
    form.reset();
    sheetStoreRef.current.setState((s) => ({ ...s, step: "values" }));
    onOpenChange(false);
  };
  return (
    <form.Subscribe selector={(s) => ({ address: s.values.address })}>
      {({ address }) => {
        const selectedAddress = address || presetAddress || "";
        const isValidAddress = isAddress(selectedAddress);

        return (
          <ActionFormSheet
            open={open}
            onOpenChange={(next) => {
              if (!next) resetAndClose();
              onOpenChange(next);
            }}
            asset={asset}
            title={t("tokens:blocklist.title")}
            description={t("tokens:blocklist.description", {
              defaultValue: "Manage addresses in the blocklist",
            })}
            submitLabel={t("common:save")}
            hasValuesStep={true}
            canContinue={() => isValidAddress}
            store={sheetStoreRef.current}
            confirm={
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("tokens:blocklist.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {t("tokens:columns.contractAddress", {
                        defaultValue: "Contract Address",
                      })}
                    </div>
                    <div className="text-sm font-medium">{asset.id}</div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          {mode === "add"
                            ? t("tokens:blocklist.block", {
                                defaultValue: "Block",
                              })
                            : t("common:remove")}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {isValidAddress ? (
                            <Badge>{selectedAddress}</Badge>
                          ) : (
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
            disabled={() => !isValidAddress}
            onSubmit={async (verification) => {
              const addr = getEthereumAddress(selectedAddress);
              const promise = (async () => {
                await freezeAddress({
                  contract: asset.id,
                  walletVerification: verification,
                  userAddress: addr,
                  freeze: mode === "add" ? true : false,
                });
                await Promise.all([
                  queryClient.invalidateQueries({
                    queryKey: orpc.token.read.queryKey({
                      input: { tokenAddress: asset.id },
                    }),
                  }),
                  queryClient.invalidateQueries({
                    queryKey: orpc.token.holders.queryKey({
                      input: { tokenAddress: asset.id },
                    }),
                  }),
                ]);
                onCompleted({ address: addr, mode });
              })();

              toast
                .promise(promise, {
                  loading: t("common:saving"),
                  success: t("common:saved"),
                  error: (data) => t("common:error", { message: data.message }),
                })
                .unwrap()
                .then(() => {
                  resetAndClose();
                })
                .catch(() => undefined);
            }}
          >
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("tokens:blocklist.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="inline-flex rounded-md border p-1 text-xs">
                    <Button
                      type="button"
                      variant={mode === "add" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setMode("add");
                      }}
                    >
                      {t("tokens:blocklist.block", { defaultValue: "Block" })}
                    </Button>
                    <Button
                      type="button"
                      variant={mode === "remove" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setMode("remove");
                      }}
                    >
                      {t("common:remove")}
                    </Button>
                  </div>

                  <AddressSelectOrInputToggle>
                    {({ mode }) => (
                      <>
                        {mode === "select" && (
                          <form.AppField
                            name="address"
                            children={(field) => (
                              <field.AddressSelectField
                                scope="user"
                                required
                                label={t("common:address", {
                                  defaultValue: "Address",
                                })}
                              />
                            )}
                          />
                        )}
                        {mode === "manual" && (
                          <form.AppField
                            name="address"
                            children={(field) => (
                              <field.AddressInputField
                                required
                                label={t("common:address", {
                                  defaultValue: "Address",
                                })}
                              />
                            )}
                          />
                        )}
                      </>
                    )}
                  </AddressSelectOrInputToggle>
                </CardContent>
              </Card>
            </div>
          </ActionFormSheet>
        );
      }}
    </form.Subscribe>
  );
}
