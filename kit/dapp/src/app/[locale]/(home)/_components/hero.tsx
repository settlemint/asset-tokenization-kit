"use client";
import { LanguageToggle } from "@/components/blocks/language/language-toggle";
import { Logo } from "@/components/blocks/logo/logo";
import { ThemeToggle } from "@/components/blocks/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image, { type StaticImageData } from "next/image";
import * as React from "react";
import HeroDark from "./assets/hero-dark.png";
import HeroLight from "./assets/hero-light.png";

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: {
    regular: string;
    gradient: string;
  };
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  bottomImage?: {
    light: string;
    dark: string;
  };
  buttons?: {
    main: {
      text: string;
      href: string;
    };
    secondary: {
      text: string;
      href: string;
    };
    tertiary: {
      text: string;
      href: string;
    };
  };
  footerLinks?: {
    href: string;
    label: string;
  }[];
}

const ThemeImage = React.memo(function ThemeImage({
  light,
  dark,
}: {
  light: string | StaticImageData;
  dark: string | StaticImageData;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and before mounting, render both images with opacity-0
  if (!mounted) {
    return (
      <div className="relative w-full">
        <Image
          src={light}
          className="max-w-full opacity-0 shadow-lg"
          priority
          placeholder="blur"
          alt="Dashboard preview"
          fill
        />
        <Image
          src={dark}
          className="absolute top-0 left-0 max-w-full opacity-0 shadow-lg"
          alt="Dashboard preview"
          priority
          placeholder="blur"
          fill
        />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Image
        src={light}
        className={cn(
          "max-w-full shadow-lg transition-opacity duration-300",
          resolvedTheme === "dark" ? "opacity-0" : "opacity-100"
        )}
        sizes="(max-width: 1050px) 100vw, 1050px"
        width={1050}
        height={674}
        quality={75}
        alt="Dashboard preview"
      />
      <Image
        src={dark}
        className={cn(
          "absolute top-0 left-0 max-w-full shadow-lg transition-opacity duration-300",
          resolvedTheme === "dark" ? "opacity-100" : "opacity-0"
        )}
        sizes="(max-width: 1050px) 100vw, 1050px"
        width={1050}
        height={674}
        quality={75}
        alt="Dashboard preview"
      />
    </div>
  );
});

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title,
      subtitle = {
        regular: "Unlock the power of ",
        gradient: "Asset Tokenization.",
      },
      description = "This kit is pre-configured to leverage your SettleMint application and provide an easy way to get started with your own asset tokenization solution.",
      ctaText = "bunx @settlemint/sdk-cli@latest create",
      ctaHref = "https://github.com/settlemint/starterkit-asset-tokenization",
      bottomImage = {
        light: HeroLight,
        dark: HeroDark,
      },
      buttons = {
        main: {
          text: "My Portfolio",
          href: "/portfolio",
        },
        secondary: {
          text: "Issuer Portal",
          href: "/admin",
        },
        tertiary: {
          text: "Documentation",
          href: "https://console.settlemint.com/documentation",
        },
      },
      footerLinks = [
        {
          href: "https://console.settlemint.com/documentation/docs/terms-and-policies/terms-of-service/",
          label: "Terms of Service",
        },
        {
          href: "https://console.settlemint.com/documentation/docs/terms-and-policies/privacy-policy/",
          label: "Privacy Policy",
        },
        {
          href: "https://console.settlemint.com/documentation/docs/terms-and-policies/cookie-policy/",
          label: "Cookie Policy",
        },
      ],
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-0 h-screen w-screen bg-[radial-gradient(ellipse_50%_80%_at_50%_-20%,hsl(var(--sidebar-ring))_3%,transparent_70%)] dark:bg-[radial-gradient(ellipse_50%_80%_at_50%_-20%,hsl(var(--sidebar-ring))_5%,transparent_70%)]" />
        <section className="relative z-1 mx-auto max-w-full">
          <div className="z-10 mx-auto max-w-(--breakpoint-xl) gap-12 px-4 py-28 md:px-8 ">
            <div className="absolute top-8 left-8 flex items-center gap-3">
              <Logo className="w-48" />
              <LanguageToggle size="icon" variant="outline" />
              <ThemeToggle />
            </div>
            <div className="absolute top-8 right-8 flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href={buttons.tertiary.href}>
                  {buttons.tertiary.text}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={buttons.secondary.href}>
                  {buttons.secondary.text}
                </Link>
              </Button>
              <Button asChild>
                <Link href={buttons.main.href}>{buttons.main.text}</Link>
              </Button>
            </div>
            <div className="mx-auto max-w-3xl space-y-5 text-center leading-0 lg:leading-5">
              <h2 className="mx-auto bg-[linear-gradient(180deg,_hsl(var(--foreground))_0%,_hsl(var(--foreground)/75%)_100%)] bg-clip-text font-geist text-4xl text-transparent tracking-tighter md:text-6xl">
                {subtitle.regular}
                <br />
                <span className="bg-linear-to-r from-[hsl(var(--accent))] to-[hsl(var(--chart-2))] bg-clip-text text-transparent">
                  {subtitle.gradient}
                </span>
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                {description}
              </p>
              <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,hsl(var(--accent))_0%,hsl(var(--chart-2))_50%,hsl(var(--accent))_100%)]" />
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background font-medium font-mono text-xs backdrop-blur-3xl">
                    <Link
                      href={ctaHref}
                      className="group inline-flex w-full items-center justify-center rounded-full border-[1px] border-input bg-linear-to-tr from-[hsl(var(--accent))/20] via-[hsl(var(--chart-2))/30] to-transparent px-10 py-4 text-center text-foreground transition-all hover:bg-linear-to-tr hover:from-[hsl(var(--accent))/30] hover:via-[hsl(var(--chart-2))/40] hover:to-transparent sm:w-auto"
                    >
                      {ctaText}
                    </Link>
                  </div>
                </span>
              </div>
            </div>
            {bottomImage && (
              <div className="relative z-10 mx-auto mt-32 max-w-[1050px] px-4 md:px-10">
                <ThemeImage light={bottomImage.light} dark={bottomImage.dark} />
              </div>
            )}
          </div>
          <footer className="flex w-full shrink-0 flex-col items-center gap-2 px-4 py-6 sm:flex-row md:px-6">
            <p className="text-xs">
              &copy; {new Date().getFullYear()}{" "}
              <Link href="https://settlemint.com" className="hover:underline">
                SettleMint
              </Link>
              . Functional Source License, Version 1.1, MIT Future License.
            </p>
            <NavigationMenu className="flex gap-4 sm:ml-auto sm:gap-6">
              <NavigationMenuList>
                {footerLinks.map(({ href, label }) => (
                  <NavigationMenuItem key={href}>
                    <NavigationMenuLink
                      className={cn(navigationMenuTriggerStyle(), "text-xs")}
                      asChild
                    >
                      <Link href={href}>{label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </footer>
        </section>
      </div>
    );
  }
);
HeroSection.displayName = "HeroSection";

export { HeroSection };
