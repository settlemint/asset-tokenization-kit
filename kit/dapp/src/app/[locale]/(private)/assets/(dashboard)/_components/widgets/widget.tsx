import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WidgetProps {
  label: string;
  value: string;
  subtext: string;
}

export function Widget({ label, value, subtext }: WidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="font-bold text-3xl">{value}</CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {subtext}
      </CardFooter>
    </Card>
  );
}
