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
    label: "User 1",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957927",
    label: "User 2",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957928",
    label: "User 3",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957929",
    label: "User 4",
  },
  {
    value: "0xb794f5ea0ba39494ce839613fffba7427957925",
    label: "User 5",
  },
];

const DictionaryInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, name = "", placeholder = "" }) => {
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
          return (
            <div ref={containerRef} className={cn("w-full", className)}>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" aria-expanded={open} className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <AddressAvatar address={entries.find((entry) => entry.label === value)?.value} variant="tiny" />
                      {value
                        ? `${entries.find((entry) => entry.label === value)?.value} (${value})`
                        : "Select entry..."}
                    </div>

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
