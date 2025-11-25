import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, AreaChart, Area, ComposedChart
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StatisticsChartProps {
  type: "pie" | "line" | "bar" | "area" | "composed" | "table";
  data: any[];
  title: string;
  onPeriodChange?: (period: "day" | "week" | "month") => void;
  columns?: string[]; // For table type
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const chartLineColor = 'hsl(var(--chart-1))';
const chartFillColor = 'hsl(var(--chart-2))';

export default function StatisticsChart({ type, data, title, onPeriodChange, columns }: StatisticsChartProps) {
  const renderChart = () => {
    if (type === "table") {
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns?.map((col) => (
                  <TableHead key={col} className="text-xs">{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  {columns?.map((col) => (
                    <TableCell key={col} className="text-sm">
                      {typeof row[col] === 'number' ? row[col].toFixed(1) : row[col]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
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
        ) : type === "line" ? (
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
              {/* Render all numeric keys as lines */}
              {data.length > 0 && Object.keys(data[0]).filter(k => k !== 'name').map((key, idx) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : type === "area" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
              {data.length > 0 && Object.keys(data[0]).filter(k => k !== 'name').map((key, idx) => (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  fill={COLORS[idx % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : type === "bar" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              {data.length > 0 && Object.keys(data[0]).filter(k => k !== 'name').map((key, idx) => (
                <Bar 
                  key={key}
                  dataKey={key}
                  fill={COLORS[idx % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : type === "composed" ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
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
              {data.length > 0 && Object.keys(data[0]).filter(k => k !== 'name').map((key, idx) => {
                if (idx === 0) {
                  return <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} />;
                } else {
                  return <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />;
                }
              })}
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    );
  };

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

      {renderChart()}
    </Card>
  );
}
