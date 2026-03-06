import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Coffee, ShieldCheck, Handshake, ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ExportadorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ exportacoes: 0, lotesDisponiveis: 0, eudrOk: 0, contratos: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [{ count: exp }, { data: lotes }, { count: com }] = await Promise.all([
        supabase.from("exportacoes").select("*", { count: "exact", head: true }),
        supabase.from("lotes").select("estado"),
        supabase.from("comercializacao").select("*", { count: "exact", head: true }),
      ]);
      const disponiveis = lotes?.filter(l => l.estado === "aprovado").length || 0;
      setStats({ exportacoes: exp || 0, lotesDisponiveis: disponiveis, eudrOk: disponiveis, contratos: com || 0 });
    };
    fetch();
  }, []);

  const kpis = [
    { label: "Exportações", value: stats.exportacoes, icon: FileText },
    { label: "Lotes Disponíveis", value: stats.lotesDisponiveis, icon: Coffee },
    { label: "EUDR Conformes", value: stats.eudrOk, icon: ShieldCheck },
    { label: "Contratos", value: stats.contratos, icon: Handshake },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Exportador</h1>
        <p className="text-muted-foreground">Exportações, conformidade e contratos comerciais</p>
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
          <Button variant="outline" onClick={() => navigate("/nova-exportacao")}><Plus className="h-4 w-4 mr-2" />Nova Exportação</Button>
          <Button variant="outline" onClick={() => navigate("/exportacao")}><ArrowRight className="h-4 w-4 mr-2" />Exportações</Button>
          <Button variant="outline" onClick={() => navigate("/comercializacao")}><ArrowRight className="h-4 w-4 mr-2" />Comercialização</Button>
        </CardContent>
      </Card>
    </div>
  );
};
