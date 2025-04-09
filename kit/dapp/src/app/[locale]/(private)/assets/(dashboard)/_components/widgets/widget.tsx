import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ReactNode } from "react";

interface WidgetProps {
  label: string;
  value: string | ReactNode;
  subtext: string;
}

export function Widget({ label, value, subtext }: WidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="font-bold text-3xl">{value}</CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        {subtext}
      </CardFooter>
    </Card>
  );
}
