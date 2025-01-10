'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { type InputHTMLAttributes, forwardRef } from 'react';
import { Controller } from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface DictionaryInputProps extends InputHTMLAttributes<HTMLInputElement> {
  options: Option[];
}

const DictionaryInput = forwardRef<HTMLInputElement, DictionaryInputProps>(
  ({ className, name = '', placeholder = '', options = [], ...props }) => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('');
    const [width, setWidth] = React.useState(0);
    const [showDialog, setShowDialog] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setWidth(rect.width);
      }
    }, []);

    return (
      <Controller
        name={name}
        render={({ field }) => {
          return (
            <div ref={containerRef} className={cn('w-full', className)}>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" aria-expanded={open} className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <AddressAvatar address={options.find((option) => option.label === value)?.value} variant="tiny" />
                      {value
                        ? `${options.find((option) => option.label === value)?.value} (${value})`
                        : 'Select option...'}
                    </div>

                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" style={{ width }}>
                  <Command accessKey="label">
                    <CommandInput placeholder={placeholder} accessKey="label" />
                    <div className="m-2 flex justify-between gap-2">
                      <Input
                        placeholder="New address"
                        {...field}
                        {...props}
                        onChange={(e) => {
                          field.onChange(value);
                          setValue(e.target.value);
                        }}
                        value={value}
                      />
                      <Button variant="outline" className="w-40" onClick={() => setShowDialog(true)}>
                        Add to Addressbook
                      </Button>
                    </div>
                    <CommandList>
                      <CommandEmpty>No option found.</CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.label}
                            onSelect={(currentValue) => {
                              setValue(currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn('mr-2 h-4 w-4', value === option.label ? 'opacity-100' : 'opacity-0')}
                            />
                            {option.label}
                            <AddressAvatar address={option.value} variant="tiny" />
                            <span>{option.value}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add to Addressbook</DialogTitle>
                  </DialogHeader>
                  {/* <CreateAddressBookEntryForm
                    defaultValues={{ walletAddress: value as `0x${string}`, walletName: '' }}
                    formId="create-address-book-entry-form"
                  /> */}
                </DialogContent>
              </Dialog>
            </div>
          );
        }}
      />
    );
  }
);

DictionaryInput.displayName = 'DictionaryInput';

export { DictionaryInput };
