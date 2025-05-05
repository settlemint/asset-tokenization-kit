"use client";

import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import type { CreateDepositInput } from "@/lib/mutations/deposit/create/create-schema";
import type { CreateEquityInput } from "@/lib/mutations/equity/create/create-schema";
import type { CreateFundInput } from "@/lib/mutations/fund/create/create-schema";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { AssetType } from "../types";
import { isBasicInfoValid, isConfigurationValid } from "../utils";

export function useAssetDesignerForms() {
  // Form state tracking
  const [isBasicInfoFormValid, setIsBasicInfoFormValid] = useState(false);
  const [isConfigurationFormValid, setIsConfigurationFormValid] =
    useState(false);
  const [isPermissionsFormValid, setIsPermissionsFormValid] = useState(false);
  const [isRegulationFormValid, setIsRegulationFormValid] = useState(true); // Default to true since it's optional

  // Selected asset type
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType>(null);

  // Create forms for each asset type with mode set to run validation always
  const bondForm = useForm<CreateBondInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      isin: "",
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all", // Validate on all events
  });

  const cryptocurrencyForm = useForm<CreateCryptoCurrencyInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all",
  });

  const equityForm = useForm<CreateEquityInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      cusip: "",
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all",
  });

  const fundForm = useForm<CreateFundInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      decimals: 18,
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all",
  });

  const stablecoinForm = useForm<CreateStablecoinInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all",
  });

  const depositForm = useForm<CreateDepositInput>({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [],
      selectedRegulations: [],
    },
    mode: "all",
  });

  // Get the appropriate form based on asset type
  const getFormForAssetType = () => {
    switch (selectedAssetType) {
      case "bond":
        return bondForm;
      case "cryptocurrency":
        return cryptocurrencyForm;
      case "equity":
        return equityForm;
      case "fund":
        return fundForm;
      case "stablecoin":
        return stablecoinForm;
      case "deposit":
        return depositForm;
      default:
        exhaustiveGuard(selectedAssetType);
    }
  };

  // Reset all forms
  const resetForms = () => {
    bondForm.reset();
    cryptocurrencyForm.reset();
    equityForm.reset();
    fundForm.reset();
    stablecoinForm.reset();
    depositForm.reset();

    setIsBasicInfoFormValid(false);
    setIsConfigurationFormValid(false);
    setIsPermissionsFormValid(false);
  };

  // Check form validity when the asset type changes
  useEffect(() => {
    if (!selectedAssetType) return;

    const form = getFormForAssetType();

    // Check basic info validity
    setIsBasicInfoFormValid(isBasicInfoValid(form));

    // Check configuration validity
    setIsConfigurationFormValid(isConfigurationValid(form, selectedAssetType));

    // Since permissions are optional, always consider them valid
    setIsPermissionsFormValid(true);

    // Set up subscription to form changes
    const subscription = form.watch(() => {
      setIsBasicInfoFormValid(isBasicInfoValid(form));
      setIsConfigurationFormValid(
        isConfigurationValid(form, selectedAssetType)
      );
    });

    return () => {
      if (subscription && typeof subscription === "object") {
        try {
          // @ts-expect-error - The subscription object has an unsubscribe method
          subscription.unsubscribe?.();
        } catch (error) {
          console.error("Error unsubscribing from form watch:", error);
        }
      }
    };
  }, [selectedAssetType]);

  return {
    selectedAssetType,
    setSelectedAssetType,
    bondForm,
    cryptocurrencyForm,
    equityForm,
    fundForm,
    stablecoinForm,
    depositForm,
    getFormForAssetType,
    resetForms,
    isBasicInfoFormValid,
    isConfigurationFormValid,
    isPermissionsFormValid,
    isRegulationFormValid,
  };
}
