import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user, roles, hasRole } = useAuth();

  const { data: stats = { totalLotes: 0, lotesAprovados: 0, lotesPendentes: 0, totalExploracoes: 0 }, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [lotesRes, exploracoesRes] = await Promise.all([
        supabase.from("lotes").select("estado"),
        supabase.from("exploracoes").select("*", { count: "exact", head: true }),
      ]);
      const lotes = lotesRes.data || [];
      return {
        totalLotes: lotes.length,
        lotesAprovados: lotes.filter((l) => l.estado === "aprovado").length,
        lotesPendentes: lotes.filter((l) => l.estado === "pendente").length,
        totalExploracoes: exploracoesRes.count || 0,
      };
    },
    staleTime: 30_000, // 30s cache
  });

  const renderDashboard = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-16" /><Skeleton className="h-4 w-32 mt-2" /></CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bem-vindo ao INCA Coffee Trace</h1>
          <p className="text-muted-foreground text-sm">Sistema Nacional de Rastreabilidade do Café</p>
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
