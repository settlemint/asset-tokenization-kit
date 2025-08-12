import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/use-app-form";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { orpc } from "@/orpc/orpc-client";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { useQueryClient } from "@tanstack/react-query";
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
  const [mode, setMode] = useState<BlocklistActionMode>(defaultMode);

  const form = useAppForm({
    defaultValues: {
      address: (presetAddress as string | undefined) ?? "",
      verification: undefined as
        | {
            verificationCode: string;
            verificationType?: "pincode" | "secret-code" | "two-factor";
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
        const selectedAddress = (address || presetAddress || "") as string;
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
            canContinue={() => Boolean(isValidAddress)}
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
                // Placeholder: integrate with real mutation when available.
                // We still invalidate token.read so any server-sourced data refreshes.
                await queryClient.invalidateQueries({
                  queryKey: orpc.token.read.queryOptions({
                    input: { tokenAddress: asset.id },
                  }).queryKey,
                });
                onCompleted({ address: addr, mode });
              })();

              toast.promise(promise, {
                loading: t("common:saving"),
                success: t("common:saved"),
                error: t("common:error"),
              });

              await promise;
              resetAndClose();
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
                      onClick={() => setMode("add")}
                    >
                      {t("tokens:blocklist.block", { defaultValue: "Block" })}
                    </Button>
                    <Button
                      type="button"
                      variant={mode === "remove" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMode("remove")}
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
                              <field.AddressSelectField scope="user" required />
                            )}
                          />
                        )}
                        {mode === "manual" && (
                          <form.AppField
                            name="address"
                            children={(field) => (
                              <field.AddressInputField required />
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
