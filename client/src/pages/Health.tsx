import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar, ChevronLeft, ChevronRight, Plus, Droplet } from "lucide-react";
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
  const [showDialog, setShowDialog] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputGlucose, setInputGlucose] = useState('');
  const [inputInsulin, setInputInsulin] = useState('');
  const [inputWater, setInputWater] = useState('');
  const [editingField, setEditingField] = useState<'weight' | 'glucose' | 'insulin' | 'water' | null>(null);

  const dateKey = format(currentDate, 'yyyy-MM-dd');

  useEffect(() => {
    const data = getHealthData(dateKey);
    setHealthData(data);
    const water = getWaterIntake(dateKey);
    setWaterMl(water);
  }, [dateKey]);

  const handleSaveHealth = () => {
    const updates: Partial<HealthData> = {};
    
    if (editingField === 'weight' && inputWeight) {
      updates.weight = parseFloat(inputWeight);
    }
    if (editingField === 'glucose' && inputGlucose) {
      updates.glucose = parseFloat(inputGlucose);
    }
    if (editingField === 'insulin' && inputInsulin) {
      updates.insulin = parseFloat(inputInsulin);
    }
    if (editingField === 'water' && inputWater) {
      const waterValue = parseFloat(inputWater);
      saveWaterIntake(dateKey, waterValue);
      setWaterMl(waterValue);
      toast({
        title: "Acqua registrata",
        description: `${waterValue} ml di acqua registrati per ${format(currentDate, 'dd MMMM', { locale: it })}.`,
      });
      setShowDialog(false);
      setInputWater('');
      setEditingField(null);
      return;
    }

    if (Object.keys(updates).length > 0) {
      saveHealthData(dateKey, updates);
      const updated = getHealthData(dateKey);
      setHealthData(updated);
      
      toast({
        title: "Dati salvati",
        description: "I dati di salute sono stati registrati.",
      });
    }

    setShowDialog(false);
    setInputWeight('');
    setInputGlucose('');
    setInputInsulin('');
    setEditingField(null);
  };

  const openDialog = (field: 'weight' | 'glucose' | 'insulin' | 'water') => {
    setEditingField(field);
    if (field === 'weight') setInputWeight(healthData.weight?.toString() || '');
    if (field === 'glucose') setInputGlucose(healthData.glucose?.toString() || '');
    if (field === 'insulin') setInputInsulin(healthData.insulin?.toString() || '');
    if (field === 'water') setInputWater(waterMl?.toString() || '');
    setShowDialog(true);
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

        {/* Health Metrics */}
        <div className="space-y-3">
          {/* Water Intake */}
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Idratazione</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {waterMl} / {settings.waterTargetMl} ml
                </div>
              </div>
              <Progress value={Math.min((waterMl / settings.waterTargetMl) * 100, 100)} className="h-2" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{waterMl}</p>
                  <p className="text-xs text-muted-foreground">ml consumati</p>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => openDialog('water')}
                  data-testid="button-log-water"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newWater = waterMl + settings.glassCapacityMl;
                    saveWaterIntake(dateKey, newWater);
                    setWaterMl(newWater);
                    toast({
                      title: "Bicchiere aggiunto",
                      description: `${settings.glassCapacityMl} ml di acqua aggiunti.`,
                    });
                  }}
                  data-testid="button-add-glass-water"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Bicchiere
                </Button>
              </div>
            </div>
          </Card>

          {/* Weight */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Peso</p>
                <p className="text-2xl font-bold text-foreground">
                  {healthData.weight ? `${healthData.weight} kg` : '—'}
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => openDialog('weight')}
                data-testid="button-log-weight"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Glucose */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Glucosio</p>
                <p className="text-2xl font-bold text-foreground">
                  {healthData.glucose ? `${healthData.glucose} mg/dL` : '—'}
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => openDialog('glucose')}
                data-testid="button-log-glucose"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Insulin */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Insulina</p>
                <p className="text-2xl font-bold text-foreground">
                  {healthData.insulin ? `${healthData.insulin} U` : '—'}
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => openDialog('insulin')}
                data-testid="button-log-insulin"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Input Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle>
              {editingField === 'weight' && 'Registra Peso'}
              {editingField === 'glucose' && 'Registra Glucosio'}
              {editingField === 'insulin' && 'Registra Insulina'}
              {editingField === 'water' && 'Registra Acqua'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {editingField === 'weight' && (
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  placeholder="Inserisci peso..."
                  data-testid="input-weight"
                  autoFocus
                />
              </div>
            )}
            {editingField === 'glucose' && (
              <div className="space-y-2">
                <Label>Glucosio (mg/dL)</Label>
                <Input
                  type="number"
                  step="1"
                  value={inputGlucose}
                  onChange={(e) => setInputGlucose(e.target.value)}
                  placeholder="Inserisci glucosio..."
                  data-testid="input-glucose"
                  autoFocus
                />
              </div>
            )}
            {editingField === 'insulin' && (
              <div className="space-y-2">
                <Label>Insulina (U)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={inputInsulin}
                  onChange={(e) => setInputInsulin(e.target.value)}
                  placeholder="Inserisci insulina..."
                  data-testid="input-insulin"
                  autoFocus
                />
              </div>
            )}
            {editingField === 'water' && (
              <div className="space-y-2">
                <Label>Acqua (ml)</Label>
                <Input
                  type="number"
                  step="50"
                  value={inputWater}
                  onChange={(e) => setInputWater(e.target.value)}
                  placeholder="Inserisci ml di acqua..."
                  data-testid="input-water"
                  autoFocus
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-testid="button-cancel-health"
            >
              Annulla
            </Button>
            <Button
              onClick={handleSaveHealth}
              data-testid="button-save-health"
            >
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
