import TopBar from "@/components/TopBar";
import WaterTracker from "@/components/WaterTracker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { it } from "date-fns/locale";
import { getHealthData, saveHealthData, type HealthData, getWaterIntake, saveWaterIntake, loadSettings } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Health() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [healthData, setHealthData] = useState<HealthData>({ date: '' });
  const [waterMl, setWaterMl] = useState(0);
  const [settings, setSettings] = useState(loadSettings());
  
  // Inline input states for glucose and insulin
  const [glucoseInput, setGlucoseInput] = useState('');
  const [insulinInput, setInsulinInput] = useState('');
  const [weightInput, setWeightInput] = useState('');

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  useEffect(() => {
    const data = getHealthData(dateKey);
    setHealthData(data);
    const water = getWaterIntake(dateKey);
    setWaterMl(water);
    setGlucoseInput('');
    setInsulinInput('');
    setWeightInput('');
  }, [dateKey]);

  // Handle Peso save
  const handleSaveWeight = () => {
    if (!weightInput) {
      toast({
        title: "Errore",
        description: "Inserisci il peso",
        variant: "destructive",
      });
      return;
    }
    const weight = parseFloat(weightInput);
    saveHealthData(dateKey, { weight });
    const updated = getHealthData(dateKey);
    setHealthData(updated);
    setWeightInput('');
    toast({
      title: "Peso registrato",
      description: `${weight} kg registrato.`,
    });
  };

  // Handle Glucosio add (sum to current value)
  const handleAddGlucose = () => {
    if (!glucoseInput) {
      toast({
        title: "Errore",
        description: "Inserisci il valore di glucosio",
        variant: "destructive",
      });
      return;
    }
    const glucoseToAdd = parseFloat(glucoseInput);
    const currentGlucose = healthData.glucose || 0;
    const newGlucose = currentGlucose + glucoseToAdd;
    saveHealthData(dateKey, { glucose: newGlucose });
    const updated = getHealthData(dateKey);
    setHealthData(updated);
    setGlucoseInput('');
    toast({
      title: "Glucosio aggiunto",
      description: `+${glucoseToAdd} mg/dL. Totale: ${newGlucose} mg/dL.`,
    });
  };

  // Handle Insulina add (sum to current value)
  const handleAddInsulin = () => {
    if (!insulinInput) {
      toast({
        title: "Errore",
        description: "Inserisci il valore di insulina",
        variant: "destructive",
      });
      return;
    }
    const insulinToAdd = parseFloat(insulinInput);
    const currentInsulin = healthData.insulin || 0;
    const newInsulin = currentInsulin + insulinToAdd;
    saveHealthData(dateKey, { insulin: newInsulin });
    const updated = getHealthData(dateKey);
    setHealthData(updated);
    setInsulinInput('');
    toast({
      title: "Insulina aggiunta",
      description: `+${insulinToAdd} U. Totale: ${newInsulin} U.`,
    });
  };

  // Reset functions
  const resetWeight = () => {
    saveHealthData(dateKey, { weight: undefined });
    const updated = getHealthData(dateKey);
    setHealthData(updated);
    toast({
      title: "Peso azzerato",
      description: "Il peso è stato resettato.",
    });
  };

  const resetGlucose = () => {
    saveHealthData(dateKey, { glucose: undefined });
    const updated = getHealthData(dateKey);
    setHealthData(updated);
    toast({
      title: "Glucosio azzerato",
      description: "Il glucosio è stato resettato.",
    });
  };

  const resetInsulin = () => {
    saveHealthData(dateKey, { insulin: undefined });
    const updated = getHealthData(dateKey);
    setHealthData(updated);
    toast({
      title: "Insulina azzerata",
      description: "L'insulina è stata resettata.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar 
        title="Salute"
        showSearch={false}
        showAdd={false}
      />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Date Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setCurrentDate(prev => subDays(prev, 1))}
            data-testid="button-prev-day"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground text-sm">
              {format(currentDate, "EEEE, d MMMM yyyy", { locale: it })}
            </span>
          </div>

          <Button
            size="icon"
            variant="outline"
            onClick={() => setCurrentDate(prev => addDays(prev, 1))}
            data-testid="button-next-day"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Water Tracker */}
        <WaterTracker 
          mlConsumed={waterMl}
          targetMl={settings.waterTargetMl}
          glassCapacityMl={settings.glassCapacityMl}
          onAddGlass={() => setWaterMl(prev => prev + settings.glassCapacityMl)}
        />

        {/* Health Metrics */}
        <div className="space-y-4">
          {/* Peso Corporeo */}
          <Card className="p-5">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg text-foreground">Peso Corporeo</h3>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="Inserisci peso in kg"
                  data-testid="input-weight"
                  className="flex-1"
                />
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleSaveWeight}
                  data-testid="button-save-weight"
                >
                  Salva
                </Button>
              </div>
              {healthData.weight && (
                <div className="text-sm text-muted-foreground">
                  Ultimo valore: {healthData.weight} kg
                </div>
              )}
            </div>
          </Card>

          {/* Glicemia */}
          <Card className="p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Glicemia</h3>
                  <p className="text-2xl font-bold text-foreground">
                    {healthData.glucose ?? '0.0'} <span className="text-sm text-muted-foreground">mg/dL</span>
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={resetGlucose}
                  className="text-blue-500 hover:text-blue-600 border-blue-300 hover:border-blue-400"
                  data-testid="button-reset-glucose"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="1"
                  value={glucoseInput}
                  onChange={(e) => setGlucoseInput(e.target.value)}
                  placeholder="Inserisci valore"
                  data-testid="input-glucose"
                  className="flex-1"
                />
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleAddGlucose}
                  data-testid="button-add-glucose"
                >
                  + Aggiungi
                </Button>
              </div>
            </div>
          </Card>

          {/* Insulina Assunta */}
          <Card className="p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">Insulina Assunta</h3>
                  <p className="text-2xl font-bold text-foreground">
                    {healthData.insulin ?? '0.0'} <span className="text-sm text-muted-foreground">unità</span>
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={resetInsulin}
                  className="text-blue-500 hover:text-blue-600 border-blue-300 hover:border-blue-400"
                  data-testid="button-reset-insulin"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={insulinInput}
                  onChange={(e) => setInsulinInput(e.target.value)}
                  placeholder="Inserisci unità"
                  data-testid="input-insulin"
                  className="flex-1"
                />
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleAddInsulin}
                  data-testid="button-add-insulin"
                >
                  + Aggiungi
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
