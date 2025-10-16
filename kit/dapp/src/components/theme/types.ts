import type { useAppForm } from "@/hooks/use-app-form";
import type { TFunction } from "i18next";

export type ThemeFormApi = ReturnType<typeof useAppForm>;
export type ThemeTranslateFn = TFunction<["navigation", "settings"]>;
