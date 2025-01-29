import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SelectItem } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { type CreateBondFormType, PaymentFrequency } from '../schema';

export function Configuration() {
  const ref = useRef<HTMLDivElement>(null);
  const { control } = useFormContext<CreateBondFormType>();

  return (
    <div className="space-y-6">
      <div className="space-y-8">
        <div className="mb-2">
          <h2 className="font-semibold text-foreground text-lg">Configuration</h2>
          <p className="text-muted-foreground text-sm">Set parameters specific to your bond.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {/* Face value currency */}
        <FormField
          control={control}
          name="faceValueCurrency"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Face value currency</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., USDC"
                  {...field}
                  required
                  minLength={2}
                  maxLength={50}
                  pattern="^[a-zA-Z0-9\s-]+$"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Face value */}
        <FormField
          control={control}
          name="faceValue"
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Face value</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 1000"
                  {...field}
                  required
                  minLength={2}
                  maxLength={50}
                  pattern="^[a-zA-Z0-9\s-]+$"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Maturity date */}
        <FormField
          control={control}
          name="maturityDate"
          render={({ field }) => (
            <FormItem className={cn('mt-5 flex flex-col')}>
              <FormLabel className="FormLabel">
                <span>Maturity date</span>
                <span className="ml-1 text-red-500">*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />

        <CardTitle className="mt-8">Yield configuration</CardTitle>
        <CardDescription className="my-2">Set parameters specific to the yield of your bond.</CardDescription>

        {/* Coupon rate */}
        <FormField
          control={control}
          name="couponRate"
          defaultValue={0}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coupon rate</FormLabel>
              <FormControl>
                <div className="flex rounded-lg shadow-black/5 shadow-sm">
                  <Input
                    className="-me-px rounded-e-none shadow-none focus:mr-[1px]"
                    placeholder="e.g., 1000"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                    required
                    min={0}
                    step={1}
                  />
                  <span className="inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment frequency */}
        <FormField
          control={control}
          name="paymentFrequency"
          render={({ field }) => {
            return (
              <FormItem className="FormItem relative z-10 mt-5 w-full">
                <FormLabel className="FormLabel block">
                  <span>Payment frequency</span>
                  <span className="ml-1 text-red-500">*</span>
                </FormLabel>

                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl className="w-full">
                    <SelectTrigger
                      style={{ outlineWidth: '0px' }}
                      className={cn(
                        'flex h-auto items-center justify-between rounded-md border border-[hsl(var(--input))] px-3 py-2 text-sm',
                        field.value ? 'text-foreground' : 'text-muted-foreground',
                        '[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0'
                      )}
                    >
                      <SelectValue placeholder="Select payment frequency" className="!text-muted-foreground" />
                      <ChevronDown className="h-4 w-4" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    style={{ width: ref.current?.getBoundingClientRect().width }}
                    className={cn('rounded-md border bg-background', '[&_[data-highlighted]]:!bg-[hsl(var(--accent))]')}
                  >
                    {Object.entries(PaymentFrequency).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* First coupon date */}
        <FormField
          control={control}
          name="firstCouponDate"
          render={({ field }) => (
            <FormItem className={cn('mt-5 flex flex-col')}>
              <FormLabel className="FormLabel">
                <span>First payment date</span>
                <span className="ml-1 text-red-500">*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

Configuration.validatedFields = [
  'faceValueCurrency',
  'faceValue',
  'maturityDate',
  'couponRate',
  'paymentFrequency',
  'firstCouponDate',
] as const;
