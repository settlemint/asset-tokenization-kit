import { NavItem, type NavItemType } from "./navigation-item";

interface NavGroupProps {
  items: NavItemType[];
  className?: string;
  variant?: "sidebar" | "mobile";
}

export function NavGroup({ items, className, variant = "sidebar" }: NavGroupProps) {
  return (
    <nav className={`NavGroup ${className}`}>
      {items.map((item) => (
        <NavItem key={item.label} {...item} variant={variant} />
      ))}
    </nav>
  );
}
