import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, FileText, Coffee, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CompradorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ contratos: 0, volumeTotal: 0, lotesDisponiveis: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [{ data: com }, { data: lotes }] = await Promise.all([
        supabase.from("comercializacao").select("quantidade_kg"),
        supabase.from("lotes").select("estado"),
      ]);
      const vol = com?.reduce((s, c) => s + (c.quantidade_kg || 0), 0) || 0;
      const disp = lotes?.filter(l => l.estado === "aprovado").length || 0;
      setStats({ contratos: com?.length || 0, volumeTotal: Math.round(vol), lotesDisponiveis: disp });
    };
    fetch();
  }, []);

  const kpis = [
    { label: "Contratos", value: stats.contratos, icon: FileText },
    { label: "Volume Total (kg)", value: stats.volumeTotal, icon: TrendingUp },
    { label: "Lotes Disponíveis", value: stats.lotesDisponiveis, icon: Coffee },
    { label: "Compras Activas", value: stats.contratos, icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Comprador</h1>
        <p className="text-muted-foreground">Contratos e volumes adquiridos</p>
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
          <Button variant="outline" onClick={() => navigate("/comercializacao")}><ArrowRight className="h-4 w-4 mr-2" />Comercialização</Button>
          <Button variant="outline" onClick={() => navigate("/lotes")}><ArrowRight className="h-4 w-4 mr-2" />Ver Lotes</Button>
        </CardContent>
      </Card>
    </div>
  );
};
