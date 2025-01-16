import type { CreateTokenSchemaType } from '@/app/(private)/admin/tokens/_components/create-token-form/create-token-form-schema';
import { MultiSelectInput } from '@/components/blocks/form/controls/multi-select-input';
import { SelectInput } from '@/components/blocks/form/controls/select-input';
import { SelectItem } from '@/components/ui/select';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

type ItemType = {
  id: string;
  name: string;
} & { multiSelectInputEntries: string[] };

const multiSelectInputEntries = [{ value: 'value', label: 'label' }];

/**
 *  SelectOption component
 */
const SelectOption = ({ item }: { item: ItemType }) => {
  return (
    <div className="SelectOption flex items-center gap-2">
      <span>{item.name}</span>
    </div>
  );
};

/**
 *  ListItem component
 */
const ListItem = ({ item }: { item: ItemType }) => {
  return (
    <div className="ListItem flex items-center gap-2">
      <span>{item.name}</span>
    </div>
  );
};

/**
 * FormInput component
 */
export const TemplateListInput = ({
  items,
  selectionValues,
  control,
}: {
  items: ItemType[];
  selectionValues: ItemType[];
  control: UseFormReturn<CreateTokenSchemaType>['control'];
}) => {
  const [listItems, setListItems] = useState<ItemType[]>(items);

  const [selectedValue, setSelectedValue] = useState<ItemType | null>(null);

  function addItem() {
    if (selectedValue) {
      setListItems((prevItems) => {
        if (prevItems.find((item) => item.id === selectedValue.id)) {
          return prevItems;
        }
        return [...prevItems, selectedValue];
      });
    }
  }

  function removeItem(itemToRemove: string) {
    setListItems((prevItems) => prevItems.filter((item) => item.id !== itemToRemove));
  }

  return (
    <div className="ListComponent">
      {/* List component */}
      <ul>
        {listItems.map((item, index) => {
          return (
            <li className="ListItem my-6" key={item.id?.toString() + index}>
              <ListItem item={item as ItemType} />
              <MultiSelectInput
                entries={multiSelectInputEntries}
                name="tokenPermissions.0.tokenPermissions"
                control={control}
                zIndex={100 - index}
                onButtonClick={() => removeItem(item.id?.toString())}
                buttonIcon={<Minus size={12} strokeWidth={2} aria-hidden="true" color="hsl(var(--foreground))" />}
              />
            </li>
          );
        })}
      </ul>

      {/* Selection component */}
      <div className="SelectionComponent flex items-center gap-0">
        <SelectInput
          className="-me-px flex-1 rounded-e-none shadow-none focus-visible:z-10"
          control={control}
          label="Add another admin:"
          name="admin"
          placeholder="Select an admin"
          onValueChange={(value) => {
            const selectedValue = selectionValues.find((item) => item.id === value);
            setSelectedValue(selectedValue ?? null);
          }}
        >
          {selectionValues.map((item) => (
            <SelectItem
              key={item.id}
              value={item.id}
              className="h-auto w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0"
            >
              <SelectOption item={item as ItemType} />
            </SelectItem>
          ))}
        </SelectInput>
        <button
          type="button"
          className={`e inline-flex w-10 ${selectedValue ? 'h-[54px]' : 'h-[38px]'} items-center justify-center self-end rounded-e-lg border border-input bg-background text-muted-foreground/80 text-sm outline-offset-2 transition-colors hover:bg-accent hover:text-accent-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50`}
          onClick={() => {
            addItem();
          }}
        >
          <Plus size={16} strokeWidth={2} aria-hidden="true" color="hsl(var(--muted-foreground))" />
        </button>
      </div>
    </div>
  );
};
