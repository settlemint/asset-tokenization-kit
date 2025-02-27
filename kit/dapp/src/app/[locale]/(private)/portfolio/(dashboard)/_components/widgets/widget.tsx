import { Card, CardContent } from '@/components/ui/card';

interface WidgetProps {
  label: string;
  value: string;
  subtext: string;
}

export function Widget({ label, value, subtext }: WidgetProps) {
  return (
    <Card>
      <CardContent>
        <p className="mt-6 text-sm">{label}</p>
        <p className="my-2 font-bold text-3xl">{value}</p>
        <p className="text-sm text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
}
