import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Package, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Leaf,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";

export const ProducerDashboard = () => {
  const { user } = useAuth();

  // Fetch producer's explorations
  const { data: exploracoes, isLoading: loadingExploracoes } = useQuery({
    queryKey: ["producer-exploracoes", user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("entidade_id")
        .eq("id", user?.id)
        .single();
      
      if (!profile?.entidade_id) return [];
      
      const { data, error } = await supabase
        .from("exploracoes")
        .select("id, designacao, status, provincia, municipio")
        .eq("produtor_id", profile.entidade_id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch producer's parcels
  const { data: parcelas, isLoading: loadingParcelas } = useQuery({
    queryKey: ["producer-parcelas", exploracoes?.map(e => e.id)],
    queryFn: async () => {
      if (!exploracoes?.length) return [];
      const { data, error } = await supabase
        .from("parcelas")
        .select("id, codigo_parcela, area_ha, varietais, exploracao_id")
        .in("exploracao_id", exploracoes.map(e => e.id));
      if (error) throw error;
      return data;
    },
    enabled: !!exploracoes?.length,
  });

  // Fetch upcoming visits for producer's explorations
  const { data: visitas, isLoading: loadingVisitas } = useQuery({
    queryKey: ["producer-visitas", exploracoes?.map(e => e.id)],
    queryFn: async () => {
      if (!exploracoes?.length) return [];
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("visitas_tecnicas")
        .select("id, data_visita, tipo, estado, exploracao_id, objetivo")
        .in("exploracao_id", exploracoes.map(e => e.id))
        .gte("data_visita", today)
        .eq("estado", "agendada")
        .order("data_visita", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!exploracoes?.length,
  });

  // Fetch recent harvests
  const { data: colheitas, isLoading: loadingColheitas } = useQuery({
    queryKey: ["producer-colheitas", parcelas?.map(p => p.id)],
    queryFn: async () => {
      if (!parcelas?.length) return [];
      const { data, error } = await supabase
        .from("colheitas")
        .select("id, campanha, data_inicio, data_fim, volume_cereja_kg, parcela_id")
        .in("parcela_id", parcelas.map(p => p.id))
        .order("data_inicio", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!parcelas?.length,
  });

  // Calculate stats
  const totalExploracoes = exploracoes?.length || 0;
  const exploracoesValidadas = exploracoes?.filter(e => e.status === "validado").length || 0;
  const totalParcelas = parcelas?.length || 0;
  const totalArea = parcelas?.reduce((sum, p) => sum + (p.area_ha || 0), 0) || 0;
  const visitasAgendadas = visitas?.length || 0;

  const isLoading = loadingExploracoes || loadingParcelas;

  if (isLoading) {
    return <ProducerDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard do Produtor</h1>
        <p className="text-muted-foreground">Gestão das suas explorações, parcelas e colheitas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Explorações</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExploracoes}</div>
            <div className="flex gap-2 mt-1">
              {exploracoesValidadas > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {exploracoesValidadas} validadas
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcelas</CardTitle>
            <Leaf className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParcelas}</div>
            <p className="text-xs text-muted-foreground">
              {totalArea.toFixed(1)} ha de área total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colheitas Registadas</CardTitle>
            <Coffee className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{colheitas?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {colheitas?.reduce((sum, c) => sum + (c.volume_cereja_kg || 0), 0).toLocaleString("pt-AO")} kg total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitasAgendadas}</div>
            {visitas && visitas.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Próxima: {format(new Date(visitas[0].data_visita), "dd MMM", { locale: pt })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Visitas Técnicas Agendadas
            </CardTitle>
            <CardDescription>Próximas visitas às suas explorações</CardDescription>
          </CardHeader>
          <CardContent>
            {visitas && visitas.length > 0 ? (
              <div className="space-y-3">
                {visitas.map((visita) => {
                  const exploracao = exploracoes?.find(e => e.id === visita.exploracao_id);
                  return (
                    <div
                      key={visita.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <Clock className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {format(new Date(visita.data_visita), "dd MMMM yyyy", { locale: pt })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {exploracao?.designacao} • {visita.tipo}
                        </p>
                        {visita.objetivo && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {visita.objetivo}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">{visita.tipo}</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma visita agendada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Explorations Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Estado das Explorações
            </CardTitle>
            <CardDescription>Resumo das suas explorações</CardDescription>
          </CardHeader>
          <CardContent>
            {exploracoes && exploracoes.length > 0 ? (
              <div className="space-y-3">
                {exploracoes.slice(0, 4).map((exp) => {
                  const expParcelas = parcelas?.filter(p => p.exploracao_id === exp.id).length || 0;
                  return (
                    <div
                      key={exp.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      {exp.status === "validado" ? (
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                      ) : (
                        <Clock className="h-5 w-5 text-accent" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{exp.designacao}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.municipio}, {exp.provincia} • {expParcelas} parcelas
                        </p>
                      </div>
                      <Badge variant={exp.status === "validado" ? "secondary" : "outline"}>
                        {exp.status === "validado" ? "Validada" : "Pendente"}
                      </Badge>
                    </div>
                  );
                })}
                {exploracoes.length > 4 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/exploracoes">
                      Ver Todas ({exploracoes.length})
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma exploração registada</p>
                <Button variant="link" size="sm" asChild>
                  <Link to="/exploracoes/nova">Registar Exploração</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acções Rápidas</CardTitle>
          <CardDescription>Comece a registar os seus dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Button className="h-auto py-4 flex-col" asChild>
              <Link to="/exploracoes/nova">
                <MapPin className="h-5 w-5 mb-2" />
                Nova Exploração
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/parcelas/nova">
                <Leaf className="h-5 w-5 mb-2" />
                Nova Parcela
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/colheitas/nova">
                <Coffee className="h-5 w-5 mb-2" />
                Registar Colheita
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/lotes/novo">
                <Package className="h-5 w-5 mb-2" />
                Criar Lote
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProducerDashboardSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-5 w-96 mt-2" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default ProducerDashboard;
