import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  transactions: { label: "Transactions", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

// Mock data for demonstration
const chartData = [
  { week: "W1", transactions: 234 },
  { week: "W2", transactions: 312 },
  { week: "W3", transactions: 289 },
  { week: "W4", transactions: 367 },
  { week: "W5", transactions: 445 },
  { week: "W6", transactions: 398 },
];

/**
 * Transaction History Chart Component
 * 
 * Displays transaction volume over time using an area chart.
 * Currently shows mock data for demonstration purposes.
 */
export function TransactionHistoryChart() {
  const { t } = useTranslation("general");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.charts.transactionsHistory")}</CardTitle>
        <CardDescription>Weekly transaction volume</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={chartData}>
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area 
              type="monotone" 
              dataKey="transactions" 
              stroke={chartConfig.transactions.color}
              fill={chartConfig.transactions.color}
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 