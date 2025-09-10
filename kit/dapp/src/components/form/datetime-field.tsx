import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFieldContext } from "@/hooks/use-form-contexts";
import { cn } from "@/lib/utils";
import {
  addMinutes,
  addYears,
  format,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from "date-fns";
import { CalendarDays } from "lucide-react";
import { useCallback, useState } from "react";
import {
  FieldDescription,
  FieldErrors,
  FieldLabel,
  FieldLayout,
  errorClassNames,
} from "./field";

// Utility function to validate time components
const isValidTimeComponent = (hours: number, minutes: number): boolean => {
  return (
    !Number.isNaN(hours) &&
    !Number.isNaN(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  );
};

export function DateTimeField({
  label,
  description,
  required = false,
  minDate,
  maxDate = addYears(new Date(), 100),
  placeholder,
  hideTime = false,
}: {
  label: string;
  description?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  hideTime?: boolean;
}) {
  // The `Field` infers that it should have a `value` type of `Date`
  const field = useFieldContext<Date | undefined>();
  const [dateOpen, setDateOpen] = useState(false);

  const handleDateTimeSelectChange = useCallback(
    (date: Date | undefined) => {
      if (date) {
        const selectedDate = field.state.value;
        const defaultHours = minDate ? getHours(minDate) : 0;
        const defaultMinutes =
          minDate && isSameDay(date, minDate)
            ? getMinutes(addMinutes(minDate, 1))
            : 0;
        const hoursFromTimeInput = selectedDate
          ? getHours(selectedDate)
          : defaultHours;
        const minutesFromTimeInput = selectedDate
          ? getMinutes(selectedDate)
          : defaultMinutes;

        const newDate = new Date(date);
        newDate.setHours(hoursFromTimeInput, minutesFromTimeInput, 0, 0);

        field.handleChange(newDate);
      } else {
        field.handleChange(undefined);
      }
      setDateOpen(false);
    },
    [field, setDateOpen, minDate]
  );

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = e.target.value;
      const selectedDate = field.state.value;
      if (time && selectedDate) {
        const [hours, minutes] = time.split(":").map(Number);
        if (
          hours !== undefined &&
          minutes !== undefined &&
          isValidTimeComponent(hours, minutes)
        ) {
          const newDate = new Date(selectedDate);
          newDate.setHours(hours, minutes, 0, 0);
          field.handleChange(newDate);
        }
      }
    },
    [field]
  );

  const isDateDisabled = useCallback(
    (date: Date) => {
      const dayToCheck = startOfDay(date);
      if (minDate && isBefore(dayToCheck, startOfDay(minDate))) return true;
      if (maxDate && isAfter(dayToCheck, startOfDay(maxDate))) return true;
      return false;
    },
    [minDate, maxDate]
  );

  const selectedDate = field.state.value;
  const defaultTime = "10:30";

  const getMinTime = useCallback(() => {
    if (!minDate || !selectedDate) return undefined;

    // Check if selected date is the same day as minDate
    if (isSameDay(selectedDate, minDate)) {
      // If it's the same day, return the minDate's time as minimum
      const hours = getHours(minDate).toString().padStart(2, "0");
      const minutes = getMinutes(minDate).toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    return undefined;
  }, [minDate, selectedDate]);

  const getMaxTime = useCallback(() => {
    if (!maxDate || !selectedDate) return undefined;
    if (isSameDay(selectedDate, maxDate)) {
      const hours = getHours(maxDate).toString().padStart(2, "0");
      const minutes = getMinutes(maxDate).toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return undefined;
  }, [maxDate, selectedDate]);

  return (
    <FieldLayout>
      <FieldLabel htmlFor={field.name} label={label} required={required} />
      <FieldDescription description={description} />
      <div className="flex gap-4">
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id={field.name}
              className={cn(
                errorClassNames(field.state.meta),
                "justify-between font-normal",
                hideTime ? "w-full" : "w-[calc(100%-120px)]",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <span className="flex items-center">
                {selectedDate
                  ? format(selectedDate, "PPP")
                  : (placeholder ?? "Select date")}
              </span>
              <CalendarDays className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              startMonth={minDate}
              endMonth={maxDate}
              onSelect={handleDateTimeSelectChange}
              disabled={isDateDisabled}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        {!hideTime && (
          <Input
            type="time"
            step="60"
            min={getMinTime()}
            max={getMaxTime()}
            value={
              selectedDate
                ? selectedDate.toTimeString().slice(0, 5)
                : defaultTime
            }
            onChange={handleTimeChange}
            className={cn(
              errorClassNames(field.state.meta),
              "w-[120px] [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
              !selectedDate && "text-muted-foreground"
            )}
          />
        )}
      </div>
      <FieldErrors {...field.state.meta} />
    </FieldLayout>
  );
}
