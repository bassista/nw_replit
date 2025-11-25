import TopBar from "@/components/TopBar";
import StatisticsChart from "@/components/StatisticsChart";
import BadgeCard from "@/components/BadgeCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { getDailyMeal, loadDailyMeals, loadSettings } from "@/lib/storage";

export default function Stats() {
  const [activeTab, setActiveTab] = useState<"charts" | "badges">("charts");
  const [pieData, setPieData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);

  // Load and calculate real data
  useEffect(() => {
    const today = new Date();
    
    // Calculate last 7 days data for line chart
    const dailyCalories: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEE', { locale: it }).slice(0, 3).toUpperCase();
      const mealItems = getDailyMeal(dateKey);
      const calories = mealItems.reduce((sum, item) => sum + item.calories, 0);
      dailyCalories.push({ name: dayName, calories });
    }
    setLineData(dailyCalories);

    // Calculate today's macronutrient distribution for pie chart
    const todayKey = format(today, 'yyyy-MM-dd');
    const todayMeals = getDailyMeal(todayKey);
    const totalProtein = todayMeals.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = todayMeals.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = todayMeals.reduce((sum, item) => sum + item.fat, 0);
    
    // Calculate percentages
    const total = totalProtein + totalCarbs + totalFat;
    if (total > 0) {
      setPieData([
        { name: 'Proteine', value: Math.round((totalProtein / total) * 100) },
        { name: 'Carboidrati', value: Math.round((totalCarbs / total) * 100) },
        { name: 'Grassi', value: Math.round((totalFat / total) * 100) },
      ]);
    } else {
      setPieData([
        { name: 'Proteine', value: 0 },
        { name: 'Carboidrati', value: 0 },
        { name: 'Grassi', value: 0 },
      ]);
    }
  }, []);

  const mockBadges = [
    {
      id: '1',
      name: '7 Giorni Consecutivi',
      description: 'Hai tracciato i tuoi pasti per 7 giorni di fila',
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Obiettivo Acqua',
      description: 'Hai raggiunto l\'obiettivo di idratazione',
      unlocked: true,
      unlockedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      name: 'Maestro dei Nutrienti',
      description: 'Raggiungi tutti gli obiettivi nutrizionali per 7 giorni',
      unlocked: false,
    },
    {
      id: '4',
      name: 'Settimana Perfetta',
      description: 'Ottieni un punteggio A+ per 7 giorni consecutivi',
      unlocked: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Statistiche"
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="charts" className="flex-1" data-testid="tab-charts">
              <BarChart3 className="w-4 h-4 mr-2" />
              Grafici
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex-1" data-testid="tab-badges">
              <Award className="w-4 h-4 mr-2" />
              Obiettivi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-4 mt-4">
            <StatisticsChart 
              type="line"
              data={lineData}
              title="Andamento Calorie"
              onPeriodChange={(period) => console.log('Period changed:', period)}
            />
            
            <StatisticsChart 
              type="pie"
              data={pieData}
              title="Distribuzione Macronutrienti Oggi"
            />
          </TabsContent>

          <TabsContent value="badges" className="space-y-4 mt-4">
            <div className="grid gap-3">
              {mockBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
