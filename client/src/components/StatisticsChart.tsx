import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface StatisticsChartProps {
  type: "pie" | "line";
  data: any[];
  title: string;
  onPeriodChange?: (period: "day" | "week" | "month") => void;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function StatisticsChart({ type, data, title, onPeriodChange }: StatisticsChartProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {onPeriodChange && (
          <Tabs defaultValue="week" onValueChange={(v) => onPeriodChange(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="day" className="text-xs px-3 h-7" data-testid="tab-day">Giorno</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3 h-7" data-testid="tab-week">Settimana</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3 h-7" data-testid="tab-month">Mese</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      <div className="w-full h-64">
        {type === "pie" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="calories" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                name="Calorie"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
