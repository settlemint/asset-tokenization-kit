import { GOOGLE_MONO_FONTS, GOOGLE_SANS_FONTS } from "../lib/constants";

export function useGoogleFontsCatalog(): {
  sans: string[];
  mono: string[];
  isLoading: boolean;
  isError: boolean;
} {
  return {
    sans: [...GOOGLE_SANS_FONTS],
    mono: [...GOOGLE_MONO_FONTS],
    isLoading: false,
    isError: false,
  };
}
