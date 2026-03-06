import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FlaskConical, Warehouse, Coffee, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProcessadorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ transformacoes: 0, rendimentoMedio: 0, lotesProcessados: 0, stockArmazem: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [{ data: trans }, { count: lotes }, { data: arm }] = await Promise.all([
        supabase.from("transformacoes").select("rendimento_percent"),
        supabase.from("lotes").select("*", { count: "exact", head: true }),
        supabase.from("armazenamento").select("quantidade_kg"),
      ]);
      const rend = trans?.filter(t => t.rendimento_percent).map(t => t.rendimento_percent!) || [];
      const avg = rend.length > 0 ? Math.round(rend.reduce((a, b) => a + b, 0) / rend.length) : 0;
      const stock = arm?.reduce((s, a) => s + (a.quantidade_kg || 0), 0) || 0;
      setStats({ transformacoes: trans?.length || 0, rendimentoMedio: avg, lotesProcessados: lotes || 0, stockArmazem: Math.round(stock) });
    };
    fetch();
  }, []);

  const kpis = [
    { label: "Transformações", value: stats.transformacoes, icon: FlaskConical },
    { label: "Rendimento Médio", value: `${stats.rendimentoMedio}%`, icon: TrendingUp },
    { label: "Lotes no Sistema", value: stats.lotesProcessados, icon: Coffee },
    { label: "Stock Armazém (kg)", value: stats.stockArmazem, icon: Warehouse },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Processador</h1>
        <p className="text-muted-foreground">Transformação e armazenamento de café</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
              <k.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{k.value}</div></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Acções Rápidas</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/transformacao")}><ArrowRight className="h-4 w-4 mr-2" />Transformações</Button>
          <Button variant="outline" onClick={() => navigate("/armazenamento")}><ArrowRight className="h-4 w-4 mr-2" />Armazenamento</Button>
          <Button variant="outline" onClick={() => navigate("/lotes")}><ArrowRight className="h-4 w-4 mr-2" />Lotes</Button>
        </CardContent>
      </Card>
    </div>
  );
};
