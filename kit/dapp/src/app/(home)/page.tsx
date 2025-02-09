import { Logo } from '@/components/blocks/logo/logo';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';
import { NavItem } from './_components/nav-item';
import { Platform } from './_components/platform';

interface MenuItem {
  href: string;
  label: string;
  className?: string;
}

const menuItems: MenuItem[] = [
  { href: '/', label: 'Home' },
  { href: 'https://console.settlemint.com', label: 'Platform' },
  { href: 'https://console.settlemint.com/documentation', label: 'Documentation' },
];

const footerLinks = [
  {
    href: 'https://console.settlemint.com/documentation/docs/terms-and-policies/terms-of-service/',
    label: 'Terms of Service',
  },
  {
    href: 'https://console.settlemint.com/documentation/docs/terms-and-policies/privacy-policy/',
    label: 'Privacy Policy',
  },
  {
    href: 'https://console.settlemint.com/documentation/docs/terms-and-policies/cookie-policy/',
    label: 'Cookie Policy',
  },
];

const DesktopNav: FC = () => (
  <NavigationMenu className="hidden flex-grow justify-center md:flex">
    <NavigationMenuList>
      {menuItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </NavigationMenuList>
  </NavigationMenu>
);

const MobileNav: FC = () => (
  <Sheet>
    <SheetTrigger asChild className="md:hidden">
      <Button variant="ghost" size="icon" aria-label="Open menu">
        <Menu />
      </Button>
    </SheetTrigger>
    <SheetContent side="right" className="w-[200px] sm:w-[300px]">
      <SheetHeader>
        <SheetTitle>Navigation</SheetTitle>
      </SheetHeader>
      <NavigationMenu className="mt-6">
        <NavigationMenuList className="flex flex-col items-start space-x-0 space-y-2">
          {menuItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
          <NavItem href="/issuer/dashboard" label="Issuer Portal" />
          <NavItem href="/user/dashboard" label="My Portfolio" className="font-extrabold" />
        </NavigationMenuList>
      </NavigationMenu>
    </SheetContent>
  </Sheet>
);

export default function Home() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <div className="flex items-center justify-between p-6">
        <div className="w-24">
          <Logo />
        </div>
        <DesktopNav />
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavItem href="/admin" label="Issuer Portal" />
            <NavigationMenuItem>
              <Link href="/portfolio" passHref legacyBehavior>
                <NavigationMenuLink>
                  <Button className="ml-2">My Portfolio</Button>
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <MobileNav />
      </div>
      <section className="w-full flex-grow py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="font-bold text-3xl tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none ">
                Unlock the Power of Asset Tokenization
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                This starterkit is pre-configured to leverage your SettleMint application and provide an easy way to get
                started with your own asset tokenization solution.
              </p>
            </div>
            <div className="space-x-4">
              <div className="static flex w-auto justify-center overflow-x-auto rounded-xl border bg-muted p-4 backdrop-blur-2xl">
                <code className="whitespace-nowrap font-bold font-mono ">bunx @settlemint/sdk-cli@latest create</code>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-24 max-w-6xl">
          <Platform />
        </div>
      </section>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs">
          &copy; {new Date().getFullYear()}{' '}
          <Link href="https://settlemint.com" className="hover:underline">
            SettleMint
          </Link>
          . Functional Source License, Version 1.1, MIT Future License.
        </p>
        <NavigationMenu className="flex gap-4 sm:ml-auto sm:gap-6">
          <NavigationMenuList>
            {footerLinks.map(({ href, label }) => (
              <NavigationMenuItem key={href}>
                <Link href={href} legacyBehavior passHref>
                  <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'text-xs')}>
                    {label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </footer>
    </div>
  );
}
