import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Package, MapPin, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const Relatorios = () => {
  const [stats, setStats] = useState({
    totalLotes: 0,
    lotesAprovados: 0,
    totalExploracoes: 0,
    qualidadeMedia: 0,
  });
  const [lotesPorProvincia, setLotesPorProvincia] = useState<any[]>([]);
  const [lotesPorEstado, setLotesPorEstado] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Fetch lotes
      const { data: lotes } = await supabase
        .from("lotes")
        .select("estado, classificacao_sensorial");

      const approved = lotes?.filter(l => l.estado === "aprovado") || [];
      const avgQuality = approved.length > 0
        ? approved.reduce((sum, l) => sum + (l.classificacao_sensorial || 0), 0) / approved.length
        : 0;

      // Fetch exploracoes
      const { count: exploracoesCount } = await supabase
        .from("exploracoes")
        .select("*", { count: "exact", head: true });

      // Lotes por estado
      const estadoCount = lotes?.reduce((acc: any, lote) => {
        acc[lote.estado] = (acc[lote.estado] || 0) + 1;
        return acc;
      }, {});

      const estadoData = Object.entries(estadoCount || {}).map(([name, value]) => ({
        name,
        value,
      }));

      // Fetch lotes with exploration data for province breakdown
      const { data: lotesComExploracao } = await supabase
        .from("lotes")
        .select(`
          id,
          estado,
          colheitas (
            parcelas (
              exploracoes (
                provincia
              )
            )
          )
        `);

      // Count lotes by province
      const provinciaCount: any = {};
      lotesComExploracao?.forEach((lote: any) => {
        const provincia = lote.colheitas?.parcelas?.exploracoes?.provincia;
        if (provincia) {
          provinciaCount[provincia] = (provinciaCount[provincia] || 0) + 1;
        }
      });

      const provinciaData = Object.entries(provinciaCount)
        .map(([name, value]) => ({ name, lotes: value }))
        .sort((a: any, b: any) => b.lotes - a.lotes)
        .slice(0, 8);

      setStats({
        totalLotes: lotes?.length || 0,
        lotesAprovados: approved.length,
        totalExploracoes: exploracoesCount || 0,
        qualidadeMedia: Math.round(avgQuality * 10) / 10,
      });

      setLotesPorProvincia(provinciaData);
      setLotesPorEstado(estadoData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios & Análises</h1>
          <p className="text-muted-foreground">Dados estatísticos do sistema INCA Coffee Trace</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Lotes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLotes}</div>
              <p className="text-xs text-muted-foreground">Registados no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lotes Aprovados</CardTitle>
              <Award className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lotesAprovados}</div>
              <p className="text-xs text-muted-foreground">Certificados para venda</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Explorações</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExploracoes}</div>
              <p className="text-xs text-muted-foreground">Registadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualidade Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualidadeMedia || "-"}</div>
              <p className="text-xs text-muted-foreground">SCA Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Lotes por Província</CardTitle>
              <CardDescription>Top 8 províncias produtoras</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  A carregar...
                </div>
              ) : lotesPorProvincia.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={lotesPorProvincia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="lotes" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Estado</CardTitle>
              <CardDescription>Status dos lotes no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  A carregar...
                </div>
              ) : lotesPorEstado.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={lotesPorEstado}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {lotesPorEstado.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Sem dados disponíveis
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Exportar Relatórios</CardTitle>
            </div>
            <CardDescription>
              Gerar relatórios em formato PDF ou Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Funcionalidade de exportação em desenvolvimento. Em breve poderá exportar:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Relatório de Produção por Região</li>
              <li>Relatório de Qualidade e Certificações</li>
              <li>Relatório de Conformidade EUDR</li>
              <li>Relatório de Exportações</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Relatorios;
