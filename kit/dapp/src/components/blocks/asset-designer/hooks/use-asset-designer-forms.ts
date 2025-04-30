"use client";

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
  const bondForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      isin: "",
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all", // Validate on all events
  });

  const cryptocurrencyForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all",
  });

  const equityForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      cusip: "",
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all",
  });

  const fundForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      isin: "",
      decimals: 18,
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all",
  });

  const stablecoinForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
    },
    mode: "all",
  });

  const depositForm = useForm({
    defaultValues: {
      assetName: "",
      symbol: "",
      decimals: 18,
      assetAdmins: [] as string[],
      selectedRegulations: [] as string[],
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
        return bondForm; // Fallback
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
