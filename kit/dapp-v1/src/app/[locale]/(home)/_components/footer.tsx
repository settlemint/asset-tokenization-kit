import { LanguageToggle } from "@/components/blocks/language/language-toggle";
import { Logo } from "@/components/blocks/logo/logo";
import { ThemeToggle } from "@/components/blocks/theme/theme-toggle";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export async function FooterSection() {
  const t = await getTranslations("homepage.footer");

  const links = [
    {
      group: t("sections.platform.title"),
      items: [
        {
          title: t("sections.platform.console"),
          href: "https://console.settlemint.com/",
        },
        {
          title: t("sections.platform.sdk-cli"),
          href: "https://github.com/settlemint/sdk",
        },
        {
          title: t("sections.platform.mcp"),
          href: "https://github.com/settlemint/sdk/tree/main/sdk/mcp",
        },
      ],
    },
    {
      group: t("sections.resources.title"),
      items: [
        {
          title: t("sections.resources.documentation"),
          href: "https://console.settlemint.com/documentation",
        },
        {
          title: t("sections.resources.usecases"),
          href: "https://www.settlemint.com/financial-services-blockchain-use-case/",
        },
        {
          title: t("sections.resources.partners"),
          href: "https://www.settlemint.com/partners",
        },
      ],
    },
    {
      group: t("sections.company.title"),
      items: [
        {
          title: t("sections.company.about"),
          href: "https://www.settlemint.com/about",
        },
        {
          title: t("sections.company.blog"),
          href: "https://blog.settlemint.com/blog",
        },
        {
          title: t("sections.company.contact"),
          href: "https://www.settlemint.com/contact",
        },
      ],
    },
    {
      group: t("legal.title"),
      items: [
        {
          title: t("legal.privacy-policy"),
          href: "https://console.settlemint.com/documentation/docs/terms-and-policies/privacy-policy/",
        },
        {
          title: t("legal.cookie-policy"),
          href: "https://console.settlemint.com/documentation/docs/terms-and-policies/cookie-policy/",
        },
        {
          title: t("legal.terms-of-service"),
          href: "https://console.settlemint.com/documentation/docs/terms-and-policies/terms-of-service/",
        },
      ],
    },
  ];

  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mb-8 border-b md:mb-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-6 px-6 pb-6">
          <Link href="/" aria-label="go home" className="block size-fit">
            <Logo className="w-32" />
          </Link>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="https://twitter.com/SettleMintCOM"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X/Twitter"
              className="text-muted-foreground hover:text-primary block"
            >
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
                ></path>
              </svg>
            </Link>
            <Link
              href="https://www.linkedin.com/company/settlemint/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-primary block"
            >
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
                ></path>
              </svg>
            </Link>
            <Link
              href="https://www.facebook.com/settlemint"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-muted-foreground hover:text-primary block"
            >
              <svg
                className="size-6"
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95"
                ></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {links.map((link, index) => (
            <div key={index} className="space-y-4 text-sm">
              <span className="block font-medium">{link.group}</span>
              {link.items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary block duration-150"
                >
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
          <small className="text-muted-foreground order-last block text-center text-sm md:order-first">
            {t("legal.copyright", { year: new Date().getFullYear() })}
          </small>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
