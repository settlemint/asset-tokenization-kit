"use client";

import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import type { InputHTMLAttributes } from "react";

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, onChange, debounce]);

  return (
    <Input
      {...props}
      value={value}
      onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      }, [])}
    />
  );
}
