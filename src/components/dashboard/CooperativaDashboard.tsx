import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, MapPin, Sprout, Coffee, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CooperativaDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ produtores: 0, areaTotal: 0, colheitas: 0, lotes: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [{ count: exp }, { data: parcelas }, { count: colheitas }, { count: lotes }] = await Promise.all([
        supabase.from("exploracoes").select("*", { count: "exact", head: true }),
        supabase.from("parcelas").select("area_ha"),
        supabase.from("colheitas").select("*", { count: "exact", head: true }),
        supabase.from("lotes").select("*", { count: "exact", head: true }),
      ]);
      const area = parcelas?.reduce((s, p) => s + (p.area_ha || 0), 0) || 0;
      setStats({ produtores: exp || 0, areaTotal: Math.round(area), colheitas: colheitas || 0, lotes: lotes || 0 });
    };
    fetch();
  }, []);

  const kpis = [
    { label: "Explorações", value: stats.produtores, icon: Users, color: "text-primary" },
    { label: "Área Total (ha)", value: stats.areaTotal, icon: MapPin, color: "text-secondary" },
    { label: "Colheitas", value: stats.colheitas, icon: Sprout, color: "text-accent" },
    { label: "Lotes", value: stats.lotes, icon: Coffee, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Cooperativa</h1>
        <p className="text-muted-foreground">Visão agregada dos produtores associados</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{k.label}</CardTitle>
              <k.icon className={`h-4 w-4 ${k.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acções Rápidas</CardTitle>
            <CardDescription>Operações frequentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/exploracoes/nova")}>
              <Plus className="h-4 w-4 mr-2" /> Nova Exploração
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/colheitas/nova")}>
              <Plus className="h-4 w-4 mr-2" /> Registar Colheita
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/lotes")}>
              <ArrowRight className="h-4 w-4 mr-2" /> Ver Lotes
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Estado geral da cooperativa</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A cooperativa gere {stats.produtores} explorações com uma área total de {stats.areaTotal} ha,
              {stats.colheitas} colheitas registadas e {stats.lotes} lotes no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
