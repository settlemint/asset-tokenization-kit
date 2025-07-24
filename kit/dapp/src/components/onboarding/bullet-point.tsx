import { cn } from "@/lib/utils";

interface BulletPointProps {
  children: React.ReactNode;
  className?: string;
}

export function BulletPoint({ children, className }: BulletPointProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}
