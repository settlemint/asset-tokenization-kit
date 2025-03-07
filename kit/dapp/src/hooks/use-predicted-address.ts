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

export function usePredictedAddress<T extends FieldValues>({
  calculateAddress,
  fieldName,
}: UsePredictedAddressProps<T>) {
  const [isCalculating, setIsCalculating] = useState(false);
  const { setValue, setError, getValues, getFieldState } = useFormContext<T>();
  const values = getValues();
  const fieldState = getFieldState(fieldName);

  useEffect(() => {
    const calculate = async () => {
      setIsCalculating(true);
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
        setIsCalculating(false);
      }
    };

    void calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isCalculating,
    error: fieldState.error?.message,
  };
}
