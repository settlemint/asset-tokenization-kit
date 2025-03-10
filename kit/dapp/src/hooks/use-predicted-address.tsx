import { useEffect } from "react";
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
  const { setValue, setError, getValues } = useFormContext<T>();
  const values = getValues();

  useEffect(() => {
    const calculate = async () => {
      try {
        const predictedAddress = await calculateAddress(values);
        setValue(fieldName, predictedAddress as PathValue<T, Path<T>>, {
          shouldValidate: true,
        });
      } catch {
        setError(fieldName, {
          message: "Failed to calculate predicted address",
        });
      }
    };

    void calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
