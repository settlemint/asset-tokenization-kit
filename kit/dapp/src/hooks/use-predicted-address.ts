import { useEffect, useState } from "react";
import {
  useFormContext,
  type FieldValues,
  type Path,
  type PathValue,
} from "react-hook-form";

interface UsePredictedAddressProps<T extends FieldValues> {
  calculateAddress: (data: T) => Promise<string>;
  fieldName: Path<T>;
}

export function useVerifyPredictedAddress<T extends FieldValues>({
  calculateAddress,
  fieldName,
}: UsePredictedAddressProps<T>) {
  const [isCalculatingAddress, setIsCalculatingAddress] = useState(false);
  const {
    setValue,
    setError,
    getValues,
    getFieldState,
    formState: { isValidating },
  } = useFormContext<T>();
  const values = getValues();
  const fieldState = getFieldState(fieldName);

  useEffect(() => {
    const calculate = async () => {
      setIsCalculatingAddress(true);
      try {
        const predictedAddress = await calculateAddress(values);
        setValue(fieldName, predictedAddress as PathValue<T, Path<T>>, {
          shouldValidate: true,
        });
      } catch {
        setError(fieldName, {
          message: "Failed to calculate predicted address",
        });
      } finally {
        setIsCalculatingAddress(false);
      }
    };

    void calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isCalculatingAddress: isCalculatingAddress || isValidating,
    error: fieldState.error?.message,
  };
}
