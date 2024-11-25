import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useFormity } from "formity";

import { useForm } from "react-hook-form";

type CheckboxItem = {
  label: string;
  value: string;
};
type Props = {
  fieldControlName: string;
  fieldLabel: string;
  checkboxItems: Record<string, string>;
};

const CheckboxList = ({ fieldControlName, fieldLabel, checkboxItems }: Props) => {
  const { defaultValues, resolver, onNext } = useFormity();
  const form = useForm({ defaultValues, resolver });
  return (
    <FormField
      control={form.control}
      name={fieldControlName}
      render={() => (
        <FormItem className="">
          <div className="mb-4">
            <FormLabel className="text-base">{fieldLabel}</FormLabel>
          </div>
          {Object.entries(checkboxItems).map(([key, value], _idx) => (
            <FormField
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={_idx}
              control={form.control}
              name={fieldControlName}
              render={({ field }) => {
                return (
                  <FormItem key={key} className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(key)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, key])
                            : field.onChange(field.value?.filter((value: string) => value !== key));
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{value}</FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
        </FormItem>
      )}
    />
  );
};

export default CheckboxList;
