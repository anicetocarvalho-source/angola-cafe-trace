import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { ProducerDashboard } from "@/components/dashboard/ProducerDashboard";
import { CooperativaDashboard } from "@/components/dashboard/CooperativaDashboard";
import { ProcessadorDashboard } from "@/components/dashboard/ProcessadorDashboard";
import { TransportadorDashboard } from "@/components/dashboard/TransportadorDashboard";
import { ExportadorDashboard } from "@/components/dashboard/ExportadorDashboard";
import { CompradorDashboard } from "@/components/dashboard/CompradorDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { user, roles, hasRole } = useAuth();
  const [stats, setStats] = useState({ totalLotes: 0, lotesAprovados: 0, lotesPendentes: 0, totalExploracoes: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: lotes } = await supabase.from("lotes").select("estado");
        const approved = lotes?.filter(l => l.estado === "aprovado").length || 0;
        const pending = lotes?.filter(l => l.estado === "pendente").length || 0;
        const { count } = await supabase.from("exploracoes").select("*", { count: "exact", head: true });
        setStats({ totalLotes: lotes?.length || 0, lotesAprovados: approved, lotesPendentes: pending, totalExploracoes: count || 0 });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const renderDashboard = () => {
    if (hasRole("admin_inca") || hasRole("tecnico_inca")) return <AdminDashboard stats={stats} />;
    if (hasRole("produtor")) return <ProducerDashboard />;
    if (hasRole("cooperativa")) return <CooperativaDashboard />;
    if (hasRole("processador")) return <ProcessadorDashboard />;
    if (hasRole("transportador")) return <TransportadorDashboard />;
    if (hasRole("exportador")) return <ExportadorDashboard />;
    if (hasRole("comprador")) return <CompradorDashboard />;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bem-vindo ao INCA Coffee Trace</h1>
          <p className="text-muted-foreground">Sistema Nacional de Rastreabilidade do Café</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Conta Configurada</CardTitle>
            <CardDescription>A sua conta foi criada com sucesso</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Para aceder às funcionalidades completas, contacte o administrador para atribuição de perfil.
            </p>
            <div className="space-y-2">
              <p className="text-sm"><strong>Email:</strong> {user?.email}</p>
              <p className="text-sm"><strong>Perfis:</strong> {roles.length > 0 ? roles.map(r => r.role).join(", ") : "Nenhum atribuído"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
};

export default Dashboard;
