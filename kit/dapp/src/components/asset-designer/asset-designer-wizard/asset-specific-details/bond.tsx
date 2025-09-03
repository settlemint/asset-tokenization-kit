import { AddressSelectOrInputToggle } from "@/components/address/address-select-or-input-toggle";
import type { AssetDesignerFormInputData } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { isRequiredField } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { FieldSkeleton } from "@/components/form/field-skeleton";
import { withForm } from "@/hooks/use-app-form";
import type { KeysOfUnion } from "@/lib/utils/union";
import { orpc } from "@/orpc/orpc-client";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
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
      denominationAsset:
        state.values.type === "bond"
          ? state.values.denominationAsset
          : undefined,
    }));
    const { type, decimals, denominationAsset } = values;

    // Fetch denomination asset details when an address is selected
    const denominationAssetQuery = useQuery({
      ...orpc.token.read.queryOptions({
        input: { tokenAddress: denominationAsset as Address },
      }),
      enabled: !!denominationAsset && type === "bond",
    });
    const denominationAssetDecimals = denominationAssetQuery.data?.decimals;

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

        <form.Subscribe
          selector={(state) => ({
            denominationAsset:
              state.values.type === "bond"
                ? state.values.denominationAsset
                : undefined,
          })}
        >
          {({ denominationAsset }) => {
            if (!denominationAsset || denominationAssetQuery.isError)
              return null;
            if (
              denominationAssetQuery.isLoading ||
              !denominationAssetDecimals
            ) {
              return (
                <FieldSkeleton
                  label={t("form.fields.faceValue.label")}
                  required={isRequiredField("faceValue")}
                  description={t("form.fields.faceValue.description", {
                    type: t(`asset-types:types.bond.nameLowercaseSingular`),
                  })}
                />
              );
            }
            return (
              <form.AppField
                name="faceValue"
                children={(field) => (
                  <field.DnumField
                    label={t("form.fields.faceValue.label")}
                    required={isRequiredField("faceValue")}
                    description={t("form.fields.faceValue.description", {
                      type: t(`asset-types:types.bond.nameLowercaseSingular`),
                    })}
                    decimals={denominationAssetDecimals}
                  />
                )}
              />
            );
          }}
        </form.Subscribe>
      </>
    );
  },
});
