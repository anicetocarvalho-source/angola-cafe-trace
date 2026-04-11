import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface SCAFormData {
  sca_aroma: number | null;
  sca_acidez: number | null;
  sca_corpo: number | null;
  sca_sabor: number | null;
  sca_aftertaste: number | null;
  sca_uniformidade: number | null;
  sca_balance: number | null;
  sca_clean_cup: number | null;
  sca_sweetness: number | null;
  sca_overall: number | null;
  notas_sensoriais: string | null;
}

interface SCAScoreFormProps {
  loteId: string;
  initialData: SCAFormData;
  onSaved: () => void;
}

const attributes = [
  { key: "sca_aroma", label: "Aroma", desc: "Fragrância seca e aroma húmido" },
  { key: "sca_acidez", label: "Acidez", desc: "Vivacidade e brilho" },
  { key: "sca_corpo", label: "Corpo", desc: "Textura e peso na boca" },
  { key: "sca_sabor", label: "Sabor", desc: "Paladar e complexidade" },
  { key: "sca_aftertaste", label: "Aftertaste", desc: "Persistência do sabor" },
  { key: "sca_uniformidade", label: "Uniformidade", desc: "Consistência entre chávenas" },
  { key: "sca_balance", label: "Balance", desc: "Equilíbrio dos atributos" },
  { key: "sca_clean_cup", label: "Clean Cup", desc: "Ausência de defeitos" },
  { key: "sca_sweetness", label: "Sweetness", desc: "Doçura natural" },
  { key: "sca_overall", label: "Overall", desc: "Impressão geral do avaliador" },
];

const SCAScoreForm = ({ loteId, initialData, onSaved }: SCAScoreFormProps) => {
  const [formData, setFormData] = useState<SCAFormData>(initialData);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: string) => {
    const num = value === "" ? null : parseFloat(value);
    if (num !== null && (num < 0 || num > 10)) return;
    setFormData((prev) => ({ ...prev, [key]: num }));
  };

  const totalScore = attributes.reduce((sum, attr) => {
    const val = (formData as any)[attr.key];
    return sum + (val ?? 0);
  }, 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("lotes")
        .update({
          sca_aroma: formData.sca_aroma,
          sca_acidez: formData.sca_acidez,
          sca_corpo: formData.sca_corpo,
          sca_sabor: formData.sca_sabor,
          sca_aftertaste: formData.sca_aftertaste,
          sca_uniformidade: formData.sca_uniformidade,
          sca_balance: formData.sca_balance,
          sca_clean_cup: formData.sca_clean_cup,
          sca_sweetness: formData.sca_sweetness,
          sca_overall: formData.sca_overall,
          notas_sensoriais: formData.notas_sensoriais,
          classificacao_sensorial: totalScore,
        })
        .eq("id", loteId);

      if (error) throw error;
      toast.success("Pontuações SCA guardadas com sucesso!");
      onSaved();
    } catch (error) {
      console.error("Error saving SCA scores:", error);
      toast.error("Erro ao guardar pontuações SCA");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliação Sensorial SCA</CardTitle>
        <CardDescription>
          Pontue cada atributo de 0 a 10 (protocolo SCA). Total: <strong>{totalScore.toFixed(1)} / 100</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attributes.map((attr) => (
            <div key={attr.key} className="space-y-1">
              <Label htmlFor={attr.key}>{attr.label}</Label>
              <Input
                id={attr.key}
                type="number"
                min={0}
                max={10}
                step={0.25}
                placeholder="0-10"
                value={(formData as any)[attr.key] ?? ""}
                onChange={(e) => handleChange(attr.key, e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{attr.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <Label htmlFor="notas_sensoriais">Notas Sensoriais</Label>
          <Textarea
            id="notas_sensoriais"
            placeholder="Descreva as notas sensoriais (ex: chocolate, frutos vermelhos, cítrico...)"
            value={formData.notas_sensoriais ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, notas_sensoriais: e.target.value }))}
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "A guardar..." : "Guardar Pontuações"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SCAScoreForm;
