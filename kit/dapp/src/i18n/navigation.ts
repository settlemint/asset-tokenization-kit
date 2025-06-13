import { createNavigation } from "intl-t/navigation";
import { allowedLocales, defaultLocale } from "./locales";

export const {
  middleware,
  generateStaticParams,
  Link,
  redirect,
  useRouter,
  usePathname,
  getPathname,
} = createNavigation({
  allowedLocales: [...allowedLocales],
  defaultLocale,
});

// Export routing object for compatibility with existing code
export const routing = {
  locales: allowedLocales,
  defaultLocale,
};
