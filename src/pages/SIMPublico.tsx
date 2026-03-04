import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format, subMonths, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Coffee, Globe,
  BarChart3, Calendar, MapPin, ArrowRight, LogIn, Leaf,
} from "lucide-react";

interface MarketData {
  id: string;
  indicador: string;
  valor: number | null;
  unidade: string | null;
  fonte: string;
  localizacao: string | null;
  data_referencia: string;
}

const PIE_COLORS = [
  "hsl(25, 51%, 28%)", "hsl(100, 55%, 20%)", "hsl(32, 55%, 64%)",
  "hsl(200, 60%, 45%)", "hsl(340, 55%, 50%)", "hsl(50, 70%, 50%)",
];

const SIMPublico = () => {
  const [periodoFilter, setPeriodoFilter] = useState("12m");
  const [regiaoFilter, setRegiaoFilter] = useState("todos");

  const getDateRange = () => {
    const now = new Date();
    switch (periodoFilter) {
      case "3m": return subMonths(now, 3);
      case "6m": return subMonths(now, 6);
      case "12m": return subMonths(now, 12);
      default: return subMonths(now, 12);
    }
  };

  const { data: marketData, isLoading } = useQuery({
    queryKey: ["sim-publico", periodoFilter, regiaoFilter],
    queryFn: async () => {
      let query = supabase
        .from("sim_mercado")
        .select("*")
        .gte("data_referencia", format(getDateRange(), "yyyy-MM-dd"))
        .order("data_referencia", { ascending: true });

      if (regiaoFilter !== "todos") {
        query = query.eq("localizacao", regiaoFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketData[];
    },
  });

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
    return ((items[0].valor - items[1].valor) / items[1].valor) * 100;
  };

  const formatValue = (value: number | null, unit: string | null) => {
    if (value === null) return "N/D";
    if (unit === "USD/kg" || unit === "USD") return `$${value.toFixed(2)}`;
    if (unit === "AKZ/kg" || unit === "AKZ") return `${value.toLocaleString("pt-AO")} Kz`;
    if (unit === "ton" || unit === "kg") return `${value.toLocaleString("pt-AO")} ${unit}`;
    return value.toLocaleString("pt-AO") + (unit ? ` ${unit}` : "");
  };

  // Time series chart data
  const priceData = (() => {
    if (!marketData) return [];
    const priceItems = marketData.filter(d =>
      d.indicador.toLowerCase().includes("preco") || d.indicador.toLowerCase().includes("preço") || d.indicador.toLowerCase().includes("price")
    );
    const byDate: Record<string, any> = {};
    priceItems.forEach(d => {
      const dateKey = d.data_referencia;
      if (!byDate[dateKey]) byDate[dateKey] = { date: dateKey };
      const label = d.localizacao ? `${d.indicador} (${d.localizacao})` : d.indicador;
      if (d.valor !== null) byDate[dateKey][label] = d.valor;
    });
    return Object.values(byDate).sort((a: any, b: any) => a.date.localeCompare(b.date));
  })();

  const priceKeys = priceData.length > 0 
    ? Object.keys(priceData[0]).filter(k => k !== "date") 
    : [];

  // Production data
  const productionData = (() => {
    if (!marketData) return [];
    const prodItems = marketData.filter(d =>
      d.indicador.toLowerCase().includes("produc") || d.indicador.toLowerCase().includes("volume")
    );
    const byDate: Record<string, any> = {};
    prodItems.forEach(d => {
      const dateKey = d.data_referencia;
      if (!byDate[dateKey]) byDate[dateKey] = { date: dateKey };
      const label = d.localizacao ? `${d.localizacao}` : d.indicador;
      if (d.valor !== null) byDate[dateKey][label] = d.valor;
    });
    return Object.values(byDate).sort((a: any, b: any) => a.date.localeCompare(b.date));
  })();

  const productionKeys = productionData.length > 0
    ? Object.keys(productionData[0]).filter(k => k !== "date")
    : [];

  // Regional distribution for pie chart
  const regionalData = (() => {
    if (!marketData) return [];
    const prodByRegion: Record<string, number> = {};
    marketData.filter(d => d.localizacao && d.valor && (
      d.indicador.toLowerCase().includes("produc") || d.indicador.toLowerCase().includes("volume")
    )).forEach(d => {
      prodByRegion[d.localizacao!] = (prodByRegion[d.localizacao!] || 0) + (d.valor || 0);
    });
    return Object.entries(prodByRegion).map(([name, value]) => ({ name, value }));
  })();

  // Summary stats
  const totalIndicators = Object.keys(latestByIndicator).length;
  const totalRecords = marketData?.length || 0;
  const topIndicators = Object.values(latestByIndicator).slice(0, 6);

  const chartColors = [
    "hsl(25, 51%, 28%)", "hsl(100, 55%, 20%)", "hsl(32, 55%, 64%)",
    "hsl(200, 60%, 45%)", "hsl(340, 55%, 50%)", "hsl(50, 70%, 50%)",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Coffee className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-lg font-bold text-foreground">INCA Coffee Trace</h1>
                <p className="text-xs text-muted-foreground">Portal Público • SIM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/verificar">
                  <Globe className="h-4 w-4 mr-2" />
                  Verificar Lote
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            <Leaf className="h-3 w-3 mr-1" />
            Dados Abertos
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Sistema de Informação de Mercado
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Estatísticas agregadas do sector cafeeiro angolano. Preços, produção, exportações e tendências de mercado atualizados periodicamente.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">{totalIndicators}</strong> indicadores</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">{totalRecords}</strong> registos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">{uniqueLocations.length}</strong> regiões</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Filtrar por:</span>
          <Select value={periodoFilter} onValueChange={setPeriodoFilter}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="12m">12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Select value={regiaoFilter} onValueChange={setRegiaoFilter}>
            <SelectTrigger className="w-[160px]">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas regiões</SelectItem>
              {uniqueLocations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
            {topIndicators.map(item => {
              const trend = getTrend(item.indicador);
              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground truncate pr-2">{item.indicador}</p>
                      <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatValue(item.valor, item.unidade)}</p>
                    <div className="flex items-center justify-between mt-2">
                      {trend !== null ? (
                        <span className={`flex items-center text-xs font-medium ${trend >= 0 ? "text-secondary" : "text-destructive"}`}>
                          {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
                        </span>
                      ) : <span />}
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(item.data_referencia), "MMM yyyy", { locale: pt })}
                      </span>
                    </div>
                    {item.localizacao && (
                      <p className="text-xs text-muted-foreground mt-1">{item.localizacao} • {item.fonte}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Price Evolution Chart */}
        {priceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Evolução de Preços
              </CardTitle>
              <CardDescription>Séries temporais dos preços do café angolano</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => { try { return format(parseISO(v), "MMM yy", { locale: pt }); } catch { return v; } }}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    labelFormatter={(v) => { try { return format(parseISO(v as string), "dd MMM yyyy", { locale: pt }); } catch { return v; } }}
                    contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(30, 20%, 85%)" }}
                  />
                  <Legend />
                  {priceKeys.slice(0, 6).map((key, i) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={chartColors[i % chartColors.length]}
                      fill={chartColors[i % chartColors.length]}
                      fillOpacity={0.08}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Production Chart */}
          {productionData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  Produção por Região
                </CardTitle>
                <CardDescription>Volume de produção ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => { try { return format(parseISO(v), "MMM yy", { locale: pt }); } catch { return v; } }}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      labelFormatter={(v) => { try { return format(parseISO(v as string), "dd MMM yyyy", { locale: pt }); } catch { return v; } }}
                      contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(30, 20%, 85%)" }}
                    />
                    <Legend />
                    {productionKeys.slice(0, 6).map((key, i) => (
                      <Bar key={key} dataKey={key} fill={chartColors[i % chartColors.length]} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Regional Distribution Pie */}
          {regionalData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Distribuição Regional
                </CardTitle>
                <CardDescription>Produção acumulada por região</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={regionalData}
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={50}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {regionalData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString("pt-AO")} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Data Table Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Indicadores</CardTitle>
            <CardDescription>Últimos valores registados para cada indicador</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.values(latestByIndicator).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Indicador</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Valor</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground hidden sm:table-cell">Região</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground hidden md:table-cell">Fonte</th>
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Tendência</th>
                      <th className="py-3 font-medium text-muted-foreground">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(latestByIndicator).map(item => {
                      const trend = getTrend(item.indicador);
                      return (
                        <tr key={item.id} className="border-b border-border/50">
                          <td className="py-3 pr-4 font-medium text-foreground">{item.indicador}</td>
                          <td className="py-3 pr-4 font-semibold text-foreground">{formatValue(item.valor, item.unidade)}</td>
                          <td className="py-3 pr-4 text-muted-foreground hidden sm:table-cell">{item.localizacao || "Nacional"}</td>
                          <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{item.fonte}</td>
                          <td className="py-3 pr-4">
                            {trend !== null ? (
                              <Badge variant={trend >= 0 ? "secondary" : "destructive"} className="text-xs">
                                {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3 text-muted-foreground text-xs">
                            {format(parseISO(item.data_referencia), "dd/MM/yyyy")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Sem dados de mercado disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <Coffee className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Aceda a mais funcionalidades
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Registe-se na plataforma INCA Coffee Trace para gerir lotes, rastreabilidade, certificações e mais.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/auth">
                  Criar Conta
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/verificar">Verificar Lote</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-primary" />
              <span>INCA Coffee Trace — Instituto Nacional do Café de Angola</span>
            </div>
            <p>Dados actualizados periodicamente • Fonte: INCA, MINDCOM, AIPEX</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SIMPublico;
