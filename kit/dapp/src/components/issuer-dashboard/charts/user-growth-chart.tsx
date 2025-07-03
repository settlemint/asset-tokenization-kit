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
import { Line, LineChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  users: { label: "Users", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

// Mock data for demonstration
const chartData = [
  { month: "Jan", users: 45 },
  { month: "Feb", users: 52 },
  { month: "Mar", users: 61 },
  { month: "Apr", users: 58 },
  { month: "May", users: 67 },
  { month: "Jun", users: 74 },
];

/**
 * User Growth Chart Component
 *
 * Displays user growth over time using a line chart.
 * Currently shows mock data for demonstration purposes.
 */
export function UserGrowthChart() {
  const { t } = useTranslation("general");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.usersHistory")}</CardTitle>
        <CardDescription>Monthly user growth</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="users"
              stroke={chartConfig.users.color}
              strokeWidth={2}
              dot={{ fill: chartConfig.users.color }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
