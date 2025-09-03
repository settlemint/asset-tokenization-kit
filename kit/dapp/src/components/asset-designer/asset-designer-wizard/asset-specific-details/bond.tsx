import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { isRequiredField } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { withForm } from "@/hooks/use-app-form";
import type { KeysOfUnion } from "@/lib/utils/union";
import { orpc } from "@/orpc/orpc-client";
import { useStore } from "@tanstack/react-store";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Address } from "viem";

export const bondFields: KeysOfUnion<AssetDesignerFormInputData>[] = [
  "cap",
  "faceValue",
  "maturityDate",
  "denominationAsset",
];

export const BondFields = withForm({
  defaultValues: {} as AssetDesignerFormInputData,
  props: {},
  render: function Render({ form }) {
    const { t } = useTranslation(["asset-designer", "asset-types"]);
    const values = useStore(form.store, (state) => ({
      type: state.values.type,
      decimals: state.values.decimals,
      symbol: state.values.symbol,
      denominationAsset:
        state.values.type === "bond"
          ? state.values.denominationAsset
          : undefined,
    }));
    const { type, decimals, symbol, denominationAsset } = values;
    const [denominationAssetDetails, setDenominationAssetDetails] = useState<
      { decimals: number; symbol: string } | undefined
    >(undefined);

    const fetchDenominationAssetDecimals = useCallback(
      async ({ value }: { value: string }) => {
        if (!value || type !== "bond") return;

        try {
          const result = await orpc.token.read.call({
            tokenAddress: value as Address,
          });

          setDenominationAssetDetails(result);

          return undefined; // no error
        } catch {
          return {
            message: t("form.errors.denominationAssetFetch"),
            code: "DENOMINATION_ASSET_FETCH_FAILED",
          };
        }
      },
      [type, t]
    );

    // Initialize the denomination asset decimals when denomination asset is set
    useState(() => {
      if (denominationAsset) {
        void fetchDenominationAssetDecimals({
          value: denominationAsset as Address,
        });
      }
    });

    return (
      <>
        <form.AppField
          name="cap"
          children={(field) => (
            <field.DnumField
              label={t("form.fields.cap.label")}
              required={isRequiredField("cap")}
              description={t("form.fields.cap.description", {
                type: t(`asset-types:types.bond.nameLowercasePlural`),
              })}
              endAddon={symbol}
              decimals={
                typeof decimals === "number"
                  ? decimals
                  : Number.parseInt(decimals)
              }
            />
          )}
        />

        <form.AppField
          name="maturityDate"
          children={(field) => (
            <field.DateTimeField
              label={t("form.fields.maturityDate.label")}
              required={isRequiredField("maturityDate")}
              description={t("form.fields.maturityDate.description", {
                type: t(`asset-types:types.bond.nameLowercaseSingular`),
              })}
              minDate={new Date()}
            />
          )}
        />

        <AddressSelectOrInputToggle
          children={({ mode }) => (
            <>
              {mode === "select" && (
                <form.AppField
                  name="denominationAsset"
                  validators={{
                    onChangeAsync: fetchDenominationAssetDecimals,
                  }}
                  children={(field) => (
                    <field.AddressSelectField
                      scope="asset"
                      label={t("form.fields.denominationAsset.label")}
                      required={isRequiredField("denominationAsset")}
                      description={t(
                        "form.fields.denominationAsset.description",
                        {
                          type: t(
                            `asset-types:types.bond.nameLowercaseSingular`
                          ),
                        }
                      )}
                    />
                  )}
                />
              )}
              {mode === "manual" && (
                <form.AppField
                  name="denominationAsset"
                  validators={{
                    onChangeAsync: fetchDenominationAssetDecimals,
                  }}
                  children={(field) => (
                    <field.AddressInputField
                      label={t("form.fields.denominationAsset.label")}
                      required={isRequiredField("denominationAsset")}
                      description={t(
                        "form.fields.denominationAsset.description",
                        {
                          type: t(
                            `asset-types:types.bond.nameLowercaseSingular`
                          ),
                        }
                      )}
                    />
                  )}
                />
              )}
            </>
          )}
        />

        {denominationAssetDetails && (
          <form.AppField
            name="faceValue"
            children={(field) => (
              <field.DnumField
                label={t("form.fields.faceValue.label")}
                required={isRequiredField("faceValue")}
                description={t("form.fields.faceValue.description", {
                  type: t(`asset-types:types.bond.nameLowercaseSingular`),
                })}
                decimals={denominationAssetDetails.decimals}
                endAddon={denominationAssetDetails.symbol}
              />
            )}
          />
        )}
      </>
    );
  },
});
