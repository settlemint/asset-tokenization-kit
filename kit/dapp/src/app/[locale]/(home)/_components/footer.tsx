import { LanguageToggle } from "@/components/blocks/language/language-toggle";
import { Logo } from "@/components/blocks/logo/logo";
import { ThemeToggle } from "@/components/blocks/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { GitHubIcon, LinkedInIcon, XIcon } from "@daveyplate/better-auth-ui";
import { useTranslations } from "next-intl";
import * as React from "react";

type FooterProps = React.HTMLAttributes<HTMLElement>;

const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, ...props }, ref) => {
    const t = useTranslations("homepage.footer");

    return (
      <footer
        ref={ref}
        className={cn("w-full bg-background pb-12", className)}
        {...props}
      >
        <Separator className="my-8" />

        <div className="container grid gap-8 px-4 md:grid-cols-5 md:px-6 mx-auto max-w-7xl">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Logo className="w-48" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t("company-description")}
            </p>
            <div className="mt-4 flex space-x-2">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href="https://x.com/settlemintcom" aria-label="X">
                  <XIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link
                  href="https://www.linkedin.com/company/settlemint"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href="https://github.com/settlemint" aria-label="GitHub">
                  <GitHubIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold">
              {t("sections.config.title")}
            </h3>
            <div className="mt-4 space-x-4">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Platform Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold">
              {t("sections.platform.title")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="https://console.settlemint.com"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("sections.platform.console")}
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/settlemint/sdk"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("sections.platform.sdk-cli")}
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/settlemint/sdk/tree/main/sdk/mcp"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("sections.platform.mcp")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold">
              {t("sections.resources.title")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="https://console.settlemint.com/documentation"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("sections.resources.documentation")}
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.settlemint.com/financial-services-blockchain-use-case/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("sections.resources.usecases")}
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.settlemint.com/partners"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("sections.resources.partners")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold">
              {t("sections.company.title")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="https://www.settlemint.com/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("sections.company.about")}
                </Link>
              </li>
              <li>
                <Link
                  href="https://blog.settlemint.com/blog"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("sections.company.blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.settlemint.com/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t("sections.company.contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6 mx-auto max-w-7xl">
          <p className="text-xs text-muted-foreground">
            {t("legal.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-4 text-xs">
            <Link
              href="https://console.settlemint.com/documentation/docs/terms-and-policies/privacy-policy/"
              className="text-muted-foreground hover:text-foreground"
            >
              {t("legal.privacy-policy")}
            </Link>
            <Link
              href="https://console.settlemint.com/documentation/docs/terms-and-policies/terms-of-service/"
              className="text-muted-foreground hover:text-foreground"
            >
              {t("legal.terms-of-service")}
            </Link>
            <Link
              href="https://console.settlemint.com/documentation/docs/terms-and-policies/cookie-policy/"
              className="text-muted-foreground hover:text-foreground"
            >
              {t("legal.cookie-policy")}
            </Link>
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = "Footer";

export { Footer };
