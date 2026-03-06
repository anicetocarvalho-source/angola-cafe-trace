import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, MapPin, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { ComplianceMetrics } from "@/components/dashboard/ComplianceMetrics";
import { RecentNotifications } from "@/components/dashboard/RecentNotifications";
import { UrgentActions } from "@/components/dashboard/UrgentActions";
import { IoTSensorStatus } from "@/components/dashboard/IoTSensorStatus";
import { MarketDataWidget } from "@/components/dashboard/MarketDataWidget";

interface AdminDashboardProps {
  stats: {
    totalLotes: number;
    lotesAprovados: number;
    lotesPendentes: number;
    totalExploracoes: number;
  };
}

export const AdminDashboard = ({ stats }: AdminDashboardProps) => (
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
      <RecentNotifications />
      <UrgentActions />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <IoTSensorStatus />
      <MarketDataWidget />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Actividade Recente</CardTitle>
          <CardDescription>Últimas operações no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.totalLotes > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Lotes aprovados</p>
                    <p className="text-xs text-muted-foreground">{stats.lotesAprovados} lotes certificados</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Aguardam validação</p>
                    <p className="text-xs text-muted-foreground">{stats.lotesPendentes} lotes pendentes</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Explorações registadas</p>
                    <p className="text-xs text-muted-foreground">{stats.totalExploracoes} explorações</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Dados demo carregados. Sistema pronto para utilização.
              </p>
            )}
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
              {stats.lotesAprovados > 0 ? (
                <>
                  <div className="text-5xl font-bold text-primary">85.2</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <TrendingUp className="inline h-4 w-4 text-secondary mr-1" />
                    Qualidade excelente
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">Sem dados disponíveis</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <ComplianceMetrics />
  </div>
);
