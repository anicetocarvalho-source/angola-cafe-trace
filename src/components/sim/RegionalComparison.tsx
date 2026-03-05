import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface MarketData {
  id: string;
  indicador: string;
  valor: number | null;
  unidade: string | null;
  fonte: string;
  localizacao: string | null;
  data_referencia: string;
}

const INDICATORS = [
  { key: "preco_spot", label: "Preço Spot" },
  { key: "preco_interno", label: "Preço Interno" },
  { key: "producao", label: "Produção" },
  { key: "exportacao", label: "Exportação" },
  { key: "estoque", label: "Estoque" },
  { key: "qualidade_sca", label: "Qualidade SCA" },
];

const COLORS = [
  "hsl(25, 51%, 28%)", "hsl(100, 55%, 20%)", "hsl(32, 55%, 64%)",
  "hsl(200, 60%, 45%)", "hsl(340, 55%, 50%)", "hsl(50, 70%, 50%)",
];

interface Props {
  marketData: MarketData[] | undefined;
}

export default function RegionalComparison({ marketData }: Props) {
  const [activeTab, setActiveTab] = useState("preco_spot");

  const availableTabs = useMemo(() => {
    if (!marketData) return [];
    const found = new Set(marketData.filter(d => d.localizacao && d.valor !== null).map(d => d.indicador));
    return INDICATORS.filter(i => found.has(i.key));
  }, [marketData]);

  const chartData = useMemo(() => {
    if (!marketData) return [];
    // For the active indicator, get the latest value per region
    const items = marketData.filter(
      d => d.indicador === activeTab && d.localizacao && d.valor !== null
    );
    const latestByRegion: Record<string, MarketData> = {};
    items.forEach(d => {
      if (!latestByRegion[d.localizacao!] || 
          new Date(d.data_referencia) > new Date(latestByRegion[d.localizacao!].data_referencia)) {
        latestByRegion[d.localizacao!] = d;
      }
    });
    return Object.values(latestByRegion)
      .map(d => ({ regiao: d.localizacao!, valor: d.valor!, unidade: d.unidade }))
      .sort((a, b) => b.valor - a.valor);
  }, [marketData, activeTab]);

  const activeLabel = INDICATORS.find(i => i.key === activeTab)?.label || activeTab;
  const unit = chartData[0]?.unidade || "";

  if (!availableTabs.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Comparação Regional
        </CardTitle>
        <CardDescription>Último valor de cada indicador por região, lado a lado</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
            {availableTabs.map(t => (
              <TabsTrigger key={t.key} value={t.key} className="text-xs">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {availableTabs.map(t => (
            <TabsContent key={t.key} value={t.key}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="regiao" type="category" width={120} className="text-xs" />
                    <Tooltip
                      formatter={(value: number) =>
                        `${value.toLocaleString("pt-AO")}${unit ? ` ${unit}` : ""}`
                      }
                      contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(30, 20%, 85%)" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="valor"
                      name={activeLabel}
                      radius={[0, 4, 4, 0]}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">Sem dados regionais para este indicador</p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
