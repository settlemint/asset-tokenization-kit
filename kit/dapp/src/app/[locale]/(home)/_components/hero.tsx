import { WordAnimation } from "@/app/[locale]/(home)/_components/word-animation";
import { Logo } from "@/components/blocks/logo/logo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import * as React from "react";

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  buttons: {
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
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title,
      subtitle,
      description,
      ctaText,
      ctaHref,
      buttons,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("relative", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-0 h-screen w-screen bg-[radial-gradient(ellipse_50%_80%_at_50%_-20%,var(--accent)_3%,transparent_70%)] dark:bg-[radial-gradient(ellipse_50%_80%_at_50%_-20%,var(--accent)_5%,transparent_70%)]" />
        <section className="relative z-1 mx-auto max-w-full">
          <div className="z-10 mx-auto max-w-(--breakpoint-xl) gap-12 px-4 py-28 md:px-8 ">
            <div className="absolute top-8 left-8 flex items-center gap-3">
              <Logo className="w-48" />
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
              <Button asChild className="text-accent-foreground">
                <Link href={buttons.main.href}>{buttons.main.text}</Link>
              </Button>
            </div>
            <div className="mx-auto max-w-3xl space-y-5 text-center leading-0 lg:leading-5">
              <h2 className="mx-auto bg-[linear-gradient(180deg,_hsl(var(--foreground))_0%,_(var(--foreground)/75%)_100%)] bg-clip-text text-4xl md:text-6xl">
                {subtitle} <br />
                <WordAnimation />
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                {description}
              </p>
              <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0">
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,var(--accent)_0%,var(--chart-2)_50%,var(--accent)_100%)]" />
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
          </div>
        </section>
      </div>
    );
  }
);
HeroSection.displayName = "HeroSection";

export { HeroSection };
