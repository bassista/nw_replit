import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, AreaChart, Area, ComposedChart
} from "recharts";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/languageContext";

// Mapping for chart data key translations
const getKeyLabel = (key: string, language: "it" | "en"): string => {
  const translations: Record<string, Record<"it" | "en", string>> = {
    calories: { it: "Calorie", en: "Calories" },
    protein: { it: "Proteine", en: "Protein" },
    carbs: { it: "Carboidrati", en: "Carbs" },
    fat: { it: "Grassi", en: "Fat" },
    water: { it: "Acqua", en: "Water" },
    glucosio: { it: "Glucosio", en: "Glucose" },
    insulina: { it: "Insulina", en: "Insulin" },
    score: { it: "Punteggio", en: "Score" },
    weight: { it: "Peso", en: "Weight" },
    frequency: { it: "Frequenza", en: "Frequency" },
    consistency: { it: "Consistenza", en: "Consistency" },
  };
  return translations[key]?.[language] || key;
};

interface StatisticsChartProps {
  type: "pie" | "line" | "bar" | "area" | "composed" | "table" | "top-foods";
  data: any[];
  title: string;
  onPeriodChange?: (period: "day" | "week" | "month") => void;
  columns?: string[]; // For table type
  metricOptions?: string[]; // For top-foods type
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

export default function StatisticsChart({ type, data, title, onPeriodChange, columns, metricOptions }: StatisticsChartProps) {
  const { language } = useLanguage();
  const [selectedMetric, setSelectedMetric] = useState(metricOptions?.[0] || 'calorie');

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

    if (type === "top-foods") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ordina per:</span>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            {data
              .sort((a, b) => {
                const aVal = a[selectedMetric] || 0;
                const bVal = b[selectedMetric] || 0;
                return bVal - aVal;
              })
              .map((row, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <span className="font-medium text-foreground">{row.nome}</span>
                  <span className="text-sm font-semibold text-primary">
                    {typeof row[selectedMetric] === 'number' 
                      ? row[selectedMetric].toFixed(1) 
                      : row[selectedMetric]}
                  </span>
                </div>
              ))}
          </div>
        </div>
      );
    }

    return (
      <div className={`w-full ${type === "pie" ? "h-80" : "h-64"}`}>
        {type === "pie" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} cal`} />
              <Legend verticalAlign="bottom" height={36} />
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
                  name={getKeyLabel(key, language)}
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
                  name={getKeyLabel(key, language)}
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
                  name={getKeyLabel(key, language)}
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
                  return <Bar key={key} dataKey={key} name={getKeyLabel(key, language)} fill={COLORS[idx % COLORS.length]} />;
                } else {
                  return <Line key={key} type="monotone" dataKey={key} name={getKeyLabel(key, language)} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} />;
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
