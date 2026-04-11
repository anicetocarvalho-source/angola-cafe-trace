import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
}

interface SCARadarChartProps {
  scores: SCAScores;
  totalScore: number | null;
}

const getClassification = (score: number) => {
  if (score >= 90) return { label: "Outstanding", color: "bg-primary" };
  if (score >= 85) return { label: "Excellent", color: "bg-secondary" };
  if (score >= 80) return { label: "Very Good", color: "bg-accent" };
  if (score >= 70) return { label: "Good", color: "bg-muted" };
  return { label: "Below Standard", color: "bg-destructive" };
};

const SCARadarChart = ({ scores, totalScore }: SCARadarChartProps) => {
  const attributes = [
    { key: "sca_aroma", label: "Aroma" },
    { key: "sca_acidez", label: "Acidez" },
    { key: "sca_corpo", label: "Corpo" },
    { key: "sca_sabor", label: "Sabor" },
    { key: "sca_aftertaste", label: "Aftertaste" },
    { key: "sca_uniformidade", label: "Uniformidade" },
    { key: "sca_balance", label: "Balance" },
    { key: "sca_clean_cup", label: "Clean Cup" },
    { key: "sca_sweetness", label: "Sweetness" },
    { key: "sca_overall", label: "Overall" },
  ];

  const data = attributes.map((attr) => ({
    attribute: attr.label,
    value: (scores as any)[attr.key] ?? 0,
    fullMark: 10,
  }));

  const hasData = attributes.some((attr) => (scores as any)[attr.key] != null);

  if (!hasData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Sem dados sensoriais registados. Use o formulário abaixo para adicionar.</p>
        </CardContent>
      </Card>
    );
  }

  const classification = totalScore ? getClassification(totalScore) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Perfil Sensorial SCA</CardTitle>
        {totalScore && classification && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{totalScore.toFixed(1)}</span>
            <Badge className={classification.color}>{classification.label}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="attribute" className="text-xs" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} tickCount={6} />
            <Radar
              name="Pontuação"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SCARadarChart;
