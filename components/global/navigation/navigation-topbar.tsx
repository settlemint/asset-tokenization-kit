import { LanguageToggle } from "@/components/global/language-toggle";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/dark-mode/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "@/lib/i18n";
import type { NavItem } from "../layout/public-header";

interface PublicNavigationProps {
  noNavButton?: boolean;
  navButtonText?: string;
  navItems: NavItem[];
}

export function PublicNavigation({ noNavButton, navItems, navButtonText }: PublicNavigationProps) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <ThemeToggle variant="outline" className="text-foreground" />
        <LanguageToggle variant="outline" className="text-foreground" />
        {navItems.map(({ href, label }) => (
          <NavigationMenuItem key={href}>
            <Link href={href} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>{label}</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
        {!noNavButton && (
          <NavigationMenuItem>
            <Link href="/wallet" passHref legacyBehavior className="ml-4">
              <Button>{navButtonText}</Button>
            </Link>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
