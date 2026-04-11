import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

interface SCAScores {
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
  classificacao_sensorial: number | null;
}

interface SCARadarChartProps {
  lote: SCAScores;
}

const SCA_LABELS: Record<string, string> = {
  sca_aroma: "Aroma",
  sca_sabor: "Sabor",
  sca_aftertaste: "Aftertaste",
  sca_acidez: "Acidez",
  sca_corpo: "Corpo",
  sca_balance: "Equilíbrio",
  sca_uniformidade: "Uniformidade",
  sca_clean_cup: "Clean Cup",
  sca_sweetness: "Doçura",
  sca_overall: "Overall",
};

const getClassification = (score: number | null) => {
  if (!score) return { label: "N/A", color: "bg-muted" };
  if (score >= 90) return { label: "Outstanding", color: "bg-primary" };
  if (score >= 85) return { label: "Excellent", color: "bg-secondary" };
  if (score >= 80) return { label: "Very Good", color: "bg-accent" };
  if (score >= 75) return { label: "Good", color: "bg-muted" };
  return { label: "Below Specialty", color: "bg-destructive" };
};

const SCARadarChart = ({ lote }: SCARadarChartProps) => {
  const fields = Object.keys(SCA_LABELS) as (keyof typeof SCA_LABELS)[];
  const hasData = fields.some((f) => lote[f as keyof SCAScores] != null);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil Sensorial SCA</CardTitle>
          <CardDescription>Nenhuma avaliação sensorial registada</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = fields.map((key) => ({
    attribute: SCA_LABELS[key],
    score: (lote[key as keyof SCAScores] as number) ?? 0,
    fullMark: 10,
  }));

  const total = fields.reduce((sum, f) => sum + ((lote[f as keyof SCAScores] as number) ?? 0), 0);
  const classification = getClassification(lote.classificacao_sensorial ?? total);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Perfil Sensorial SCA</CardTitle>
            <CardDescription>Protocolo de cupping — pontuação por atributo</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {lote.classificacao_sensorial ?? total}
            </div>
            <Badge className={classification.color}>{classification.label}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="attribute"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Radar
                name="Pontuação"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {fields.map((key) => {
            const val = lote[key as keyof SCAScores] as number | null;
            return (
              <div key={key} className="text-center p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{SCA_LABELS[key]}</p>
                <p className="text-lg font-semibold">{val ?? "-"}</p>
              </div>
            );
          })}
        </div>

        {/* Tasting notes */}
        {lote.notas_sensoriais && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-1">Notas de Prova</p>
            <p className="text-sm text-muted-foreground">{lote.notas_sensoriais}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SCARadarChart;
