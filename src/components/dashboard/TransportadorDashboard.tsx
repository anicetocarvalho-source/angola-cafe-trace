import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Thermometer, Droplets, Route, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TransportadorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ movimentos: 0, tempMedia: 0, humidadeMedia: 0, rotas: 0 });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("logistica").select("temp_media_c, humidade_media_percent, rota");
      if (!data) return;
      const temps = data.filter(d => d.temp_media_c).map(d => d.temp_media_c!);
      const hums = data.filter(d => d.humidade_media_percent).map(d => d.humidade_media_percent!);
      const rotas = new Set(data.map(d => d.rota).filter(Boolean)).size;
      setStats({
        movimentos: data.length,
        tempMedia: temps.length ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length) : 0,
        humidadeMedia: hums.length ? Math.round(hums.reduce((a, b) => a + b, 0) / hums.length) : 0,
        rotas,
      });
    };
    fetch();
  }, []);

  const kpis = [
    { label: "Movimentos", value: stats.movimentos, icon: Truck },
    { label: "Temp. Média (°C)", value: stats.tempMedia, icon: Thermometer },
    { label: "Humidade Média (%)", value: stats.humidadeMedia, icon: Droplets },
    { label: "Rotas Distintas", value: stats.rotas, icon: Route },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Transportador</h1>
        <p className="text-muted-foreground">Logística e condições de transporte</p>
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
          <Button variant="outline" onClick={() => navigate("/logistica")}><ArrowRight className="h-4 w-4 mr-2" />Ver Logística</Button>
          <Button variant="outline" onClick={() => navigate("/lotes")}><ArrowRight className="h-4 w-4 mr-2" />Ver Lotes</Button>
        </CardContent>
      </Card>
    </div>
  );
};
