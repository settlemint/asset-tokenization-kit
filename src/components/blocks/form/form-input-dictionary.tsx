import { AddressAvatar } from "@/components/blocks/address-avatar/address-avatar";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { type InputHTMLAttributes, forwardRef } from "react";
import { Controller } from "react-hook-form";

const entries = [
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957926",
    label: "John Doe",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957927",
    label: "Alice Cooper",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957928",
    label: "Bill Gates",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957929",
    label: "Steve Jobs",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957925",
    label: "Tim Cook",
  },
];

const DictionaryInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, name = "", placeholder = "", ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [width, setWidth] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setWidth(rect.width);
      }
    }, []); // Empty deps array since we only need this once on mount

    return (
      <Controller
        name={name}
        render={({ field }) => {
          const _value = field.value === "" ? 0 : Number(field.value);
          return (
            <div ref={containerRef} className="w-full">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" aria-expanded={open} className="w-full justify-between">
                    {value ? `${entries.find((entry) => entry.label === value)?.value} (${value})` : "Select entry..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" style={{ width }}>
                  <Command accessKey="label">
                    <CommandInput placeholder={placeholder} accessKey="label" />
                    <CommandList>
                      <CommandEmpty>No entry found.</CommandEmpty>
                      <CommandGroup>
                        {entries.map((entry) => (
                          <CommandItem
                            key={entry.value}
                            value={entry.label}
                            onSelect={(currentValue) => {
                              setValue(currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", value === entry.label ? "opacity-100" : "opacity-0")}
                            />
                            {entry.label}
                            <AddressAvatar address={entry.value} variant="tiny" />
                            <span>{entry.value}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          );
        }}
      />
    );
  },
);
DictionaryInput.displayName = "NumericInput";

export { DictionaryInput };
