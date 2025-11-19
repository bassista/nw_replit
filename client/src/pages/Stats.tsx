import TopBar from "@/components/TopBar";
import StatisticsChart from "@/components/StatisticsChart";
import BadgeCard from "@/components/BadgeCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Award } from "lucide-react";
import { useState } from "react";

export default function Stats() {
  const [activeTab, setActiveTab] = useState<"charts" | "badges">("charts");

  // Mock data - TODO: remove mock functionality
  const pieData = [
    { name: 'Proteine', value: 30 },
    { name: 'Carboidrati', value: 50 },
    { name: 'Grassi', value: 20 },
  ];

  const lineData = [
    { name: 'Lun', calories: 1800 },
    { name: 'Mar', calories: 2100 },
    { name: 'Mer', calories: 1950 },
    { name: 'Gio', calories: 2200 },
    { name: 'Ven', calories: 1880 },
    { name: 'Sab', calories: 2050 },
    { name: 'Dom', calories: 1900 },
  ];

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
