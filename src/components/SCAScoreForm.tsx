import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

const SCA_FIELDS = [
  { key: "sca_aroma", label: "Aroma" },
  { key: "sca_sabor", label: "Sabor" },
  { key: "sca_aftertaste", label: "Aftertaste" },
  { key: "sca_acidez", label: "Acidez" },
  { key: "sca_corpo", label: "Corpo" },
  { key: "sca_balance", label: "Equilíbrio" },
  { key: "sca_uniformidade", label: "Uniformidade" },
  { key: "sca_clean_cup", label: "Clean Cup" },
  { key: "sca_sweetness", label: "Doçura" },
  { key: "sca_overall", label: "Overall" },
] as const;

interface SCAScoreFormProps {
  loteId: string;
  initialValues?: Record<string, number | null>;
  initialNotes?: string | null;
  onSaved?: () => void;
}

const SCAScoreForm = ({ loteId, initialValues = {}, initialNotes, onSaved }: SCAScoreFormProps) => {
  const [scores, setScores] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    SCA_FIELDS.forEach(({ key }) => {
      init[key] = initialValues[key] != null ? String(initialValues[key]) : "";
    });
    return init;
  });
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  const total = SCA_FIELDS.reduce((sum, { key }) => {
    const v = parseFloat(scores[key]);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const handleSave = async () => {
    // Validate range 0-10
    for (const { key, label } of SCA_FIELDS) {
      const v = scores[key];
      if (v !== "") {
        const n = parseFloat(v);
        if (isNaN(n) || n < 0 || n > 10) {
          toast.error(`${label} deve ser entre 0 e 10`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const updateData: Record<string, any> = { notas_sensoriais: notes || null };
      SCA_FIELDS.forEach(({ key }) => {
        updateData[key] = scores[key] !== "" ? parseFloat(scores[key]) : null;
      });
      // Auto-calculate total
      updateData.classificacao_sensorial = total > 0 ? Math.round(total * 10) / 10 : null;

      const { error } = await supabase
        .from("lotes")
        .update(updateData)
        .eq("id", loteId);

      if (error) throw error;
      toast.success("Perfil sensorial guardado!");
      onSaved?.();
    } catch (error: any) {
      toast.error(error.message || "Erro ao guardar perfil sensorial");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliação Sensorial SCA</CardTitle>
        <CardDescription>
          Pontue cada atributo de 0 a 10 — Total: <span className="font-bold text-foreground">{total.toFixed(1)}</span>/100
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SCA_FIELDS.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={key} className="text-xs">{label}</Label>
              <Input
                id={key}
                type="number"
                step="0.25"
                min="0"
                max="10"
                placeholder="0-10"
                value={scores[key]}
                onChange={(e) => setScores((prev) => ({ ...prev, [key]: e.target.value }))}
                className="text-center"
              />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <Label htmlFor="notas_sensoriais">Notas de Prova</Label>
          <Textarea
            id="notas_sensoriais"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Floral, cítrico, chocolate negro, acidez brilhante..."
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "A guardar..." : "Guardar Perfil Sensorial"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SCAScoreForm;
