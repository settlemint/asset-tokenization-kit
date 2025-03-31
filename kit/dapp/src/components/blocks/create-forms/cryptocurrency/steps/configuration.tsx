import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { isAddressAvailable } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-address-available";
import { getPredictedAddress } from "@/lib/queries/cryptocurrency-factory/cryptocurrency-factory-predict-address";
import { fiatCurrencies } from "@/lib/utils/typebox/fiat-currency";
import { Loader2, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useFormContext, useWatch, type UseFormReturn } from "react-hook-form";

export function Configuration() {
  const formMethods = useFormContext<CreateCryptoCurrencyInput>();
  const { control, setValue, clearErrors, setError, formState, trigger } =
    formMethods;
  const t = useTranslations("private.assets.create");
  const currencyOptions = fiatCurrencies.map((currency) => ({
    value: currency,
    label: currency,
  }));

  const [checkingAddress, setCheckingAddress] = useState(false);
  const [addressAvailable, setAddressAvailable] = useState<boolean | null>(
    null
  );

  // Watch the values needed for address prediction
  const assetName = useWatch({ control, name: "assetName" });
  const symbol = useWatch({ control, name: "symbol" });
  const decimals = useWatch({ control, name: "decimals" });
  const initialSupply = useWatch({ control, name: "initialSupply" });

  // Reset all validation state completely
  const resetValidationState = useCallback(() => {
    // Clear form errors
    clearErrors();
    // Reset availability state
    setAddressAvailable(null);
    // Reset hidden input field directly - use a proper zero address instead of empty string
    setValue("predictedAddress", "0x0000000000000000000000000000000000000000", {
      shouldValidate: false,
    });
    console.log("Validation state completely reset");
  }, [clearErrors, setAddressAvailable, setValue]);

  // Reset address availability state when any parameter changes to prevent showing stale errors
  useEffect(() => {
    console.log("Parameters changed - resetting validation state");
    resetValidationState();
  }, [assetName, symbol, decimals, initialSupply, resetValidationState]);

  // Function to check address availability - centralized to avoid code duplication
  const checkAddressAvailability = useCallback(
    async (force = false) => {
      // Only check if all required fields have values
      if (!assetName || !symbol || !decimals || !initialSupply) {
        setAddressAvailable(null);
        clearErrors("predictedAddress");
        return;
      }

      try {
        setCheckingAddress(true);
        clearErrors("predictedAddress");

        // Generate a unique timestamp to prevent caching issues
        console.log(
          `Checking parameters at ${Date.now()}: ${assetName}, ${symbol}, ${decimals}, ${initialSupply}`
        );

        // Predict the address
        const predictedAddress = await getPredictedAddress({
          assetName,
          symbol,
          decimals,
          initialSupply,
        });

        console.log(
          `Predicted address for current parameters: ${predictedAddress}`
        );

        // Check if address is available - adding timestamp to prevent caching
        const available = await isAddressAvailable(predictedAddress);

        // Update UI state and form value
        setAddressAvailable(available);
        setValue("predictedAddress", predictedAddress, {
          shouldValidate: true,
        });

        // Set error if address is not available
        if (!available) {
          setError("predictedAddress", {
            type: "duplicate",
            message: "cryptocurrency.duplicate",
          });
          // Force validation to ensure form state is updated
          await trigger("predictedAddress");
        } else {
          clearErrors("predictedAddress");
        }

        return available;
      } catch (error) {
        console.error("Error checking address availability:", error);
        setAddressAvailable(null);
        clearErrors("predictedAddress");
        return null;
      } finally {
        setCheckingAddress(false);
      }
    },
    [
      assetName,
      symbol,
      decimals,
      initialSupply,
      setValue,
      setError,
      clearErrors,
      trigger,
    ]
  );

  // Check when input values change
  useEffect(() => {
    // Clear any previous timers
    const timer = setTimeout(() => {
      console.log("Debounced check triggered for params change");
      checkAddressAvailability();
    }, 800); // Increase debounce time for better user experience
    return () => clearTimeout(timer);
  }, [assetName, symbol, decimals, initialSupply, checkAddressAvailability]);

  // Handler for checking right after user finishes entering a value
  const handleInputBlur = useCallback(() => {
    console.log("Input blur triggered - immediate validation");
    // Get reference to input element for focus
    const inputElement = document.querySelector('input[name="initialSupply"]');
    // Immediate check on blur with focus forcing and no debounce
    checkAddressAvailability(true).then((available) => {
      if (available === false && inputElement instanceof HTMLInputElement) {
        inputElement.focus();
      }
    });
  }, [checkAddressAvailability]);

  return (
    <FormStep
      title={t("configuration.cryptocurrencies.title")}
      description={t("configuration.cryptocurrencies.description")}
      isNextDisabled={addressAvailable === false || checkingAddress}
    >
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <FormInput
            control={control}
            name="initialSupply"
            type="number"
            label={t("parameters.cryptocurrencies.initial-supply-label")}
            description={t(
              "parameters.cryptocurrencies.initial-supply-description"
            )}
            required
            onBlur={handleInputBlur}
          />

          {/* Address availability indicator */}
          {checkingAddress && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking if these parameters can be used...
            </div>
          )}
        </div>

        <FormInput
          control={control}
          type="number"
          name="price.amount"
          required
          label={t("parameters.common.price-label")}
          postfix={
            <FormSelect
              name="price.currency"
              control={control}
              options={currencyOptions}
              className="border-l-0 rounded-l-none w-26 shadow-none -mx-3"
            />
          }
        />
      </div>

      {/* Show prominent error if address is not available */}
      {!checkingAddress && addressAvailable === false && (
        <Alert variant="destructive" className="mt-4 border-2">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            Duplicate Cryptocurrency Detected
          </AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>
              A cryptocurrency with these exact parameters already exists. To
              proceed, you must modify at least one of:
            </p>
            <ul className="list-disc ml-6">
              <li>
                Token Name (currently: <strong>{assetName}</strong>)
              </li>
              <li>
                Symbol (currently: <strong>{symbol}</strong>)
              </li>
              <li>
                Decimals (currently: <strong>{decimals}</strong>)
              </li>
              <li>
                Initial Supply (currently: <strong>{initialSupply}</strong>)
              </li>
            </ul>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="self-start mt-2"
                onClick={() => checkAddressAvailability(true)}
              >
                Revalidate Parameters
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden input for validation */}
      <input
        type="hidden"
        {...formMethods.register("predictedAddress", {
          validate: {
            available: (value) => {
              // Log the validation execution
              console.log(
                `Validating predictedAddress=${value}, addressAvailable=${addressAvailable}`
              );
              // Only validate if we have actually run a check
              if (addressAvailable === null) return true;
              // Otherwise use the addressAvailable state
              return (
                addressAvailable ||
                "A cryptocurrency with these parameters already exists"
              );
            },
          },
        })}
      />
    </FormStep>
  );
}

Configuration.validatedFields = [
  "initialSupply",
  "price",
  "predictedAddress",
] satisfies (keyof CreateCryptoCurrencyInput)[];

// Add beforeValidate to ensure predictedAddress is validated before proceeding
Configuration.beforeValidate = [
  async ({
    getValues,
    setValue,
    setError,
    clearErrors,
    trigger,
  }: UseFormReturn<CreateCryptoCurrencyInput>) => {
    const values = getValues();
    try {
      // Only proceed if all required fields are filled
      if (
        !values.assetName ||
        !values.symbol ||
        !values.decimals ||
        !values.initialSupply
      ) {
        return false;
      }

      // Predict the address
      const predictedAddress = await getPredictedAddress({
        assetName: values.assetName,
        symbol: values.symbol,
        decimals: values.decimals,
        initialSupply: values.initialSupply,
      });

      // Check if address is available
      const available = await isAddressAvailable(predictedAddress);

      setValue("predictedAddress", predictedAddress);

      // Set error if address is not available
      if (!available) {
        setError("predictedAddress", {
          type: "duplicate",
          message: "cryptocurrency.duplicate",
        });
        // Trigger validation to update form state
        await trigger("predictedAddress");
        return false; // Explicitly return false to prevent going to the next step
      } else {
        clearErrors("predictedAddress");
      }

      return true; // Explicitly return true to allow going to the next step
    } catch (error) {
      console.error("Error in beforeValidate:", error);
      return false; // Prevent going to the next step on error
    }
  },
];
