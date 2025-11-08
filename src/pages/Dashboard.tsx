import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Coffee, MapPin, CheckCircle2, AlertTriangle, TrendingUp, Package } from "lucide-react";

const Dashboard = () => {
  const { user, roles, hasRole } = useAuth();
  const [stats, setStats] = useState({
    totalLotes: 0,
    lotesAprovados: 0,
    lotesPendentes: 0,
    totalExploracoes: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch lots stats
      const { data: lotes } = await supabase
        .from("lotes")
        .select("estado");

      const approved = lotes?.filter(l => l.estado === "aprovado").length || 0;
      const pending = lotes?.filter(l => l.estado === "pendente").length || 0;

      // Fetch explorations stats
      const { count: exploracoesCount } = await supabase
        .from("exploracoes")
        .select("*", { count: "exact", head: true });

      setStats({
        totalLotes: lotes?.length || 0,
        lotesAprovados: approved,
        lotesPendentes: pending,
        totalExploracoes: exploracoesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visão geral do sistema INCA Coffee Trace</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Lotes</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLotes}</div>
            <p className="text-xs text-muted-foreground">Registados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lotes Aprovados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lotesAprovados}</div>
            <p className="text-xs text-muted-foreground">Certificados para venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes Validação</CardTitle>
            <AlertTriangle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lotesPendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardam análise técnica</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Explorações</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExploracoes}</div>
            <p className="text-xs text-muted-foreground">Registadas nacionalmente</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividade Recente</CardTitle>
            <CardDescription>Últimas operações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo lote registado</p>
                  <p className="text-xs text-muted-foreground">LOT-2024-123456 - Província de Huambo</p>
                </div>
                <span className="text-xs text-muted-foreground">Há 2h</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Lote aprovado</p>
                  <p className="text-xs text-muted-foreground">LOT-2024-123450 - SCA Score 85</p>
                </div>
                <span className="text-xs text-muted-foreground">Há 5h</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nova exploração</p>
                  <p className="text-xs text-muted-foreground">Fazenda São José - Benguela</p>
                </div>
                <span className="text-xs text-muted-foreground">Há 1d</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Qualidade Média</CardTitle>
            <CardDescription>Score SCA dos lotes aprovados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">82.5</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <TrendingUp className="inline h-4 w-4 text-secondary mr-1" />
                  +2.3 vs mês anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProdutorDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard do Produtor</h1>
        <p className="text-muted-foreground">Gestão das suas explorações e lotes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meus Lotes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total registado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Explorações</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Registadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardam Validação</CardTitle>
            <AlertTriangle className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acções Rápidas</CardTitle>
          <CardDescription>Comece por registar uma exploração agrícola</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Ainda não tem explorações registadas. Registe a sua primeira exploração para começar
            a rastrear os seus lotes de café.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderDefaultDashboard = () => (
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
            Para aceder às funcionalidades completas do sistema, contacte o administrador para
            atribuição de perfil e permissões apropriadas.
          </p>
          <div className="space-y-2">
            <p className="text-sm"><strong>Email:</strong> {user?.email}</p>
            <p className="text-sm"><strong>Perfis:</strong> {roles.length > 0 ? roles.map(r => r.role).join(", ") : "Nenhum atribuído"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      {hasRole("admin_inca") || hasRole("tecnico_inca") ? (
        renderAdminDashboard()
      ) : hasRole("produtor") ? (
        renderProdutorDashboard()
      ) : (
        renderDefaultDashboard()
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
