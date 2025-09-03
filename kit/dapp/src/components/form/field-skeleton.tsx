import { Skeleton } from "@/components/ui/skeleton";
import {
  FieldDescription,
  FieldLabel,
  FieldLayout,
  FieldWithAddons,
} from "./field";

export function FieldSkeleton({
  label,
  startAddon,
  endAddon,
  description,
  required = false,
}: {
  label: string;
  startAddon?: string;
  endAddon?: string;
  description?: string;
  required?: boolean;
}) {
  return (
    <FieldLayout>
      <FieldLabel htmlFor="" label={label} required={required} />
      <FieldDescription description={description} />
      <FieldWithAddons startAddon={startAddon} endAddon={endAddon}>
        {({ className }) => <Skeleton className={`h-10 ${className}`} />}
      </FieldWithAddons>
    </FieldLayout>
  );
}
