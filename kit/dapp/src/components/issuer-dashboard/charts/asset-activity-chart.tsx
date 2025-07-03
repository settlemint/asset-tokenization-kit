import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  activity: { label: "Activity", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

// Mock data for demonstration
const chartData = [
  { day: "Mon", activity: 12 },
  { day: "Tue", activity: 19 },
  { day: "Wed", activity: 8 },
  { day: "Thu", activity: 23 },
  { day: "Fri", activity: 17 },
  { day: "Sat", activity: 14 },
  { day: "Sun", activity: 9 },
];

/**
 * Asset Activity Chart Component
 *
 * Displays asset activity over time using a bar chart.
 * Currently shows mock data for demonstration purposes.
 */
export function AssetActivityChart() {
  const { t } = useTranslation("general");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.assetActivity")}</CardTitle>
        <CardDescription>Daily asset interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="activity"
              fill={chartConfig.activity.color}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
