import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, subMonths, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Package, Globe, Plus, BarChart3, Calendar, Filter,
} from "lucide-react";

interface MarketData {
  id: string;
  indicador: string;
  valor: number | null;
  unidade: string | null;
  fonte: string;
  localizacao: string | null;
  data_referencia: string;
  created_at: string;
}

const SIM = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin_inca");

  const [periodoFilter, setPeriodoFilter] = useState("6m");
  const [localizacaoFilter, setLocalizacaoFilter] = useState("todos");
  const [indicadorFilter, setIndicadorFilter] = useState("todos");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Form state for adding new data
  const [newData, setNewData] = useState({
    indicador: "",
    valor: "",
    unidade: "USD/kg",
    fonte: "INCA",
    localizacao: "",
    data_referencia: format(new Date(), "yyyy-MM-dd"),
  });

  const getDateRange = () => {
    const now = new Date();
    switch (periodoFilter) {
      case "1m": return subMonths(now, 1);
      case "3m": return subMonths(now, 3);
      case "6m": return subMonths(now, 6);
      case "12m": return subMonths(now, 12);
      case "todos": return new Date(2020, 0, 1);
      default: return subMonths(now, 6);
    }
  };

  const { data: marketData, isLoading, refetch } = useQuery({
    queryKey: ["sim-market-data", periodoFilter, localizacaoFilter, indicadorFilter],
    queryFn: async () => {
      let query = supabase
        .from("sim_mercado")
        .select("*")
        .gte("data_referencia", format(getDateRange(), "yyyy-MM-dd"))
        .order("data_referencia", { ascending: true });

      if (localizacaoFilter !== "todos") {
        query = query.eq("localizacao", localizacaoFilter);
      }
      if (indicadorFilter !== "todos") {
        query = query.eq("indicador", indicadorFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketData[];
    },
  });

  // Derived data
  const uniqueIndicators = [...new Set(marketData?.map(d => d.indicador) || [])];
  const uniqueLocations = [...new Set(marketData?.filter(d => d.localizacao).map(d => d.localizacao!) || [])];

  // Latest values per indicator
  const latestByIndicator = marketData?.reduce((acc, item) => {
    if (!acc[item.indicador] || new Date(item.data_referencia) > new Date(acc[item.indicador].data_referencia)) {
      acc[item.indicador] = item;
    }
    return acc;
  }, {} as Record<string, MarketData>) || {};

  // Trend calculation
  const getTrend = (indicador: string) => {
    const items = marketData?.filter(d => d.indicador === indicador && d.valor !== null)
      .sort((a, b) => new Date(b.data_referencia).getTime() - new Date(a.data_referencia).getTime()) || [];
    if (items.length < 2 || !items[0].valor || !items[1].valor) return null;
    const change = ((items[0].valor - items[1].valor) / items[1].valor) * 100;
    return change;
  };

  // Chart data - pivot by date with indicators as columns
  const chartData = (() => {
    if (!marketData) return [];
    const byDate: Record<string, any> = {};
    marketData.forEach(d => {
      const dateKey = d.data_referencia;
      if (!byDate[dateKey]) byDate[dateKey] = { date: dateKey };
      if (d.valor !== null) byDate[dateKey][d.indicador] = d.valor;
    });
    return Object.values(byDate).sort((a: any, b: any) => a.date.localeCompare(b.date));
  })();

  const chartColors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#f59e0b", "#06b6d4", "#8b5cf6"];

  const handleAddData = async () => {
    if (!newData.indicador || !newData.valor || !newData.data_referencia) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    const { error } = await supabase.from("sim_mercado").insert({
      indicador: newData.indicador,
      valor: parseFloat(newData.valor),
      unidade: newData.unidade || null,
      fonte: newData.fonte,
      localizacao: newData.localizacao || null,
      data_referencia: newData.data_referencia,
    });
    if (error) {
      toast.error("Erro ao adicionar dados: " + error.message);
      return;
    }
    toast.success("Dados de mercado adicionados com sucesso");
    setAddDialogOpen(false);
    setNewData({ indicador: "", valor: "", unidade: "USD/kg", fonte: "INCA", localizacao: "", data_referencia: format(new Date(), "yyyy-MM-dd") });
    refetch();
  };

  const formatValue = (value: number | null, unit: string | null) => {
    if (value === null) return "N/D";
    if (unit === "USD/kg" || unit === "USD") return `$${value.toFixed(2)}`;
    if (unit === "AKZ/kg" || unit === "AKZ") return `${value.toLocaleString("pt-AO")} Kz`;
    if (unit === "ton" || unit === "kg") return `${value.toLocaleString("pt-AO")} ${unit}`;
    return value.toLocaleString("pt-AO") + (unit ? ` ${unit}` : "");
  };

  const topIndicators = Object.values(latestByIndicator).slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              SIM - Sistema de Informação de Mercado
            </h1>
            <p className="text-muted-foreground">
              Dados e estatísticas sobre o mercado do café angolano
            </p>
          </div>
          {isAdmin && (
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Dados
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Dados de Mercado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Indicador *</Label>
                    <Input placeholder="Ex: Preço Arábica, Volume Exportação" value={newData.indicador} onChange={e => setNewData(p => ({ ...p, indicador: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Valor *</Label>
                      <Input type="number" step="0.01" value={newData.valor} onChange={e => setNewData(p => ({ ...p, valor: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Unidade</Label>
                      <Select value={newData.unidade} onValueChange={v => setNewData(p => ({ ...p, unidade: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD/kg">USD/kg</SelectItem>
                          <SelectItem value="AKZ/kg">AKZ/kg</SelectItem>
                          <SelectItem value="ton">Toneladas</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="%">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Fonte</Label>
                      <Input value={newData.fonte} onChange={e => setNewData(p => ({ ...p, fonte: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Localização</Label>
                      <Input placeholder="Ex: Kwanza Sul" value={newData.localizacao} onChange={e => setNewData(p => ({ ...p, localizacao: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <Label>Data de Referência *</Label>
                    <Input type="date" value={newData.data_referencia} onChange={e => setNewData(p => ({ ...p, data_referencia: e.target.value }))} />
                  </div>
                  <Button onClick={handleAddData} className="w-full">Guardar</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
                <SelectTrigger className="w-[140px]"><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Último mês</SelectItem>
                  <SelectItem value="3m">3 meses</SelectItem>
                  <SelectItem value="6m">6 meses</SelectItem>
                  <SelectItem value="12m">12 meses</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={localizacaoFilter} onValueChange={setLocalizacaoFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Localização" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas regiões</SelectItem>
                  {uniqueLocations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={indicadorFilter} onValueChange={setIndicadorFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Indicador" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos indicadores</SelectItem>
                  {uniqueIndicators.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {topIndicators.map(item => {
              const trend = getTrend(item.indicador);
              return (
                <Card key={item.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium truncate">{item.indicador}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatValue(item.valor, item.unidade)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {trend !== null && (
                        <span className={`flex items-center text-xs ${trend >= 0 ? "text-secondary" : "text-destructive"}`}>
                          {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(item.data_referencia), "dd MMM", { locale: pt })}
                      </span>
                    </div>
                    {item.localizacao && <p className="text-xs text-muted-foreground mt-1">{item.localizacao}</p>}
                  </CardContent>
                </Card>
              );
            })}
            {topIndicators.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sem dados de mercado para o período seleccionado</p>
                  {isAdmin && <p className="text-sm mt-2">Clique em "Adicionar Dados" para inserir informação de mercado</p>}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Charts & Table */}
        <Tabs defaultValue="graficos">
          <TabsList>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="tabela">Tabela de Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="graficos" className="space-y-6">
            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Indicadores</CardTitle>
                <CardDescription>Séries temporais dos indicadores de mercado</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tickFormatter={(v) => { try { return format(parseISO(v), "dd/MM", { locale: pt }); } catch { return v; } }} className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip labelFormatter={(v) => { try { return format(parseISO(v as string), "dd MMM yyyy", { locale: pt }); } catch { return v; } }} />
                      <Legend />
                      {uniqueIndicators.slice(0, 6).map((ind, i) => (
                        <Area key={ind} type="monotone" dataKey={ind} stroke={chartColors[i % chartColors.length]} fill={chartColors[i % chartColors.length]} fillOpacity={0.1} strokeWidth={2} />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                    <p>Sem dados suficientes para gerar gráfico</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar Chart - Latest by indicator */}
            {Object.keys(latestByIndicator).length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Indicadores</CardTitle>
                  <CardDescription>Valores mais recentes por indicador</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.values(latestByIndicator).map(d => ({ name: d.indicador, valor: d.valor }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tabela">
            <Card>
              <CardHeader>
                <CardTitle>Dados de Mercado</CardTitle>
                <CardDescription>{marketData?.length || 0} registos encontrados</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Indicador</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Fonte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketData?.sort((a, b) => b.data_referencia.localeCompare(a.data_referencia)).map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{format(parseISO(item.data_referencia), "dd/MM/yyyy")}</TableCell>
                        <TableCell><Badge variant="outline">{item.indicador}</Badge></TableCell>
                        <TableCell className="font-medium">{formatValue(item.valor, item.unidade)}</TableCell>
                        <TableCell>{item.localizacao || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{item.fonte}</TableCell>
                      </TableRow>
                    ))}
                    {(!marketData || marketData.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Sem dados disponíveis
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center">
          Última actualização: {new Date().toLocaleString("pt-PT")}
        </p>
      </div>
    </DashboardLayout>
  );
};

export default SIM;
