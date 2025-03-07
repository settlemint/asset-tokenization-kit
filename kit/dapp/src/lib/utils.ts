import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type PathsToStringProps<T> = T extends string
  ? ""
  : {
      [K in keyof T]: T[K] extends object
        ? `${K & string}.${PathsToStringProps<T[K]>}`
        : K & string;
    }[keyof T];
