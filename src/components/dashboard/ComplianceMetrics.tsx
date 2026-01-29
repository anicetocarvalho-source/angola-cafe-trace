import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  MapPin, 
  ClipboardCheck,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = {
  conforme: "hsl(var(--secondary))",
  parcial: "hsl(var(--accent))",
  naoConforme: "hsl(var(--destructive))",
  pendente: "hsl(var(--muted-foreground))",
};

const chartConfig = {
  conforme: { label: "Conforme", color: COLORS.conforme },
  parcial: { label: "Parcialmente Conforme", color: COLORS.parcial },
  nao_conforme: { label: "Não Conforme", color: COLORS.naoConforme },
  pendente: { label: "Pendente", color: COLORS.pendente },
  concluida: { label: "Concluída", color: COLORS.conforme },
  em_curso: { label: "Em Curso", color: COLORS.parcial },
  nao_cumprida: { label: "Não Cumprida", color: COLORS.naoConforme },
};

export const ComplianceMetrics = () => {
  // Fetch explorations data
  const { data: exploracoes, isLoading: loadingExploracoes } = useQuery({
    queryKey: ["compliance-exploracoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exploracoes")
        .select("id, designacao, status, provincia");
      if (error) throw error;
      return data;
    },
  });

  // Fetch visits with compliance data
  const { data: visitas, isLoading: loadingVisitas } = useQuery({
    queryKey: ["compliance-visitas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitas_tecnicas")
        .select("id, conformidade_geral, estado, tipo, exploracao_id");
      if (error) throw error;
      return data;
    },
  });

  // Fetch control actions
  const { data: acoes, isLoading: loadingAcoes } = useQuery({
    queryKey: ["compliance-acoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acoes_controlo")
        .select("id, estado, prazo, tipo");
      if (error) throw error;
      return data;
    },
  });

  const isLoading = loadingExploracoes || loadingVisitas || loadingAcoes;

  if (isLoading) {
    return <ComplianceMetricsSkeleton />;
  }

  // Calculate metrics
  const totalExploracoes = exploracoes?.length || 0;
  const exploracoesValidadas = exploracoes?.filter(e => e.status === "validado").length || 0;
  const exploracoesPendentes = exploracoes?.filter(e => e.status === "pendente").length || 0;

  const visitasRealizadas = visitas?.filter(v => v.estado === "realizada").length || 0;
  const visitasAgendadas = visitas?.filter(v => v.estado === "agendada").length || 0;

  // Compliance distribution from visits
  const conformeCount = visitas?.filter(v => v.conformidade_geral === "conforme").length || 0;
  const parcialCount = visitas?.filter(v => v.conformidade_geral === "parcialmente_conforme").length || 0;
  const naoConformeCount = visitas?.filter(v => v.conformidade_geral === "nao_conforme").length || 0;
  const semAvaliacaoCount = visitas?.filter(v => !v.conformidade_geral).length || 0;

  // Actions metrics
  const acoesPendentes = acoes?.filter(a => a.estado === "pendente").length || 0;
  const acoesEmCurso = acoes?.filter(a => a.estado === "em_curso").length || 0;
  const acoesConcluidas = acoes?.filter(a => a.estado === "concluida").length || 0;
  const acoesNaoCumpridas = acoes?.filter(a => a.estado === "nao_cumprida").length || 0;

  // Overdue actions
  const today = new Date().toISOString().split("T")[0];
  const acoesVencidas = acoes?.filter(a => 
    a.prazo && a.prazo < today && (a.estado === "pendente" || a.estado === "em_curso")
  ).length || 0;

  // Compliance rate calculation
  const totalAvaliadas = conformeCount + parcialCount + naoConformeCount;
  const taxaConformidade = totalAvaliadas > 0 
    ? Math.round((conformeCount / totalAvaliadas) * 100) 
    : 0;

  // Chart data
  const complianceDistribution = [
    { name: "Conforme", value: conformeCount, fill: COLORS.conforme },
    { name: "Parcial", value: parcialCount, fill: COLORS.parcial },
    { name: "Não Conforme", value: naoConformeCount, fill: COLORS.naoConforme },
  ].filter(d => d.value > 0);

  const actionsDistribution = [
    { status: "Pendentes", count: acoesPendentes, fill: COLORS.pendente },
    { status: "Em Curso", count: acoesEmCurso, fill: COLORS.parcial },
    { status: "Concluídas", count: acoesConcluidas, fill: COLORS.conforme },
    { status: "Não Cumpridas", count: acoesNaoCumpridas, fill: COLORS.naoConforme },
  ];

  // Province distribution
  const provinceData = exploracoes?.reduce((acc, exp) => {
    const prov = exp.provincia || "Não especificada";
    acc[prov] = (acc[prov] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const provinceChartData = Object.entries(provinceData)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Métricas de Conformidade</h2>
        <p className="text-muted-foreground">Visão geral do estado de conformidade das explorações</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
            {taxaConformidade >= 70 ? (
              <TrendingUp className="h-4 w-4 text-secondary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaConformidade}%</div>
            <p className="text-xs text-muted-foreground">
              {conformeCount} de {totalAvaliadas} explorações conformes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Explorações</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExploracoes}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {exploracoesValidadas} validadas
              </Badge>
              <Badge variant="outline" className="text-xs">
                {exploracoesPendentes} pendentes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas Técnicas</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitasRealizadas}</div>
            <p className="text-xs text-muted-foreground">
              {visitasAgendadas} visitas agendadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Pendentes</CardTitle>
            {acoesVencidas > 0 ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acoesPendentes + acoesEmCurso}</div>
            {acoesVencidas > 0 && (
              <Badge variant="destructive" className="text-xs mt-1">
                {acoesVencidas} vencidas
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Compliance Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Conformidade</CardTitle>
            <CardDescription>Resultado das visitas técnicas</CardDescription>
          </CardHeader>
          <CardContent>
            {complianceDistribution.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <PieChart>
                  <Pie
                    data={complianceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {complianceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Sem dados de conformidade
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado das Ações</CardTitle>
            <CardDescription>Ações de controlo por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={actionsDistribution} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="status" width={80} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {actionsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Province Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Explorações por Província</CardTitle>
            <CardDescription>Top 5 províncias</CardDescription>
          </CardHeader>
          <CardContent>
            {provinceChartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[200px]">
                <BarChart data={provinceChartData} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Sem dados de províncias
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo de Conformidade</CardTitle>
          <CardDescription>Detalhes do estado das visitas técnicas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10">
              <CheckCircle2 className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{conformeCount}</p>
                <p className="text-xs text-muted-foreground">Conformes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
              <AlertTriangle className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{parcialCount}</p>
                <p className="text-xs text-muted-foreground">Parcialmente Conformes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{naoConformeCount}</p>
                <p className="text-xs text-muted-foreground">Não Conformes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{semAvaliacaoCount}</p>
                <p className="text-xs text-muted-foreground">Sem Avaliação</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ComplianceMetricsSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 mt-2" />
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default ComplianceMetrics;
