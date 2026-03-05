import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { pt } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Coffee, FileText, Download, TrendingUp, TrendingDown,
  MapPin, Calendar, ArrowLeft, BarChart3, Leaf, LogIn,
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

const generateMonthOptions = () => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = subMonths(now, i);
    options.push({
      value: format(d, "yyyy-MM"),
      label: format(d, "MMMM yyyy", { locale: pt }),
    });
  }
  return options;
};

const BoletimMercado = () => {
  const monthOptions = generateMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  const monthStart = startOfMonth(parseISO(selectedMonth + "-01"));
  const monthEnd = endOfMonth(monthStart);
  const prevMonthStart = startOfMonth(subMonths(monthStart, 1));
  const prevMonthEnd = endOfMonth(prevMonthStart);

  const { data: allData, isLoading } = useQuery({
    queryKey: ["boletim-mercado", selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sim_mercado")
        .select("*")
        .gte("data_referencia", format(prevMonthStart, "yyyy-MM-dd"))
        .lte("data_referencia", format(monthEnd, "yyyy-MM-dd"))
        .order("data_referencia", { ascending: true });
      if (error) throw error;
      return data as MarketData[];
    },
  });

  const currentData = allData?.filter(d => {
    const date = parseISO(d.data_referencia);
    return isWithinInterval(date, { start: monthStart, end: monthEnd });
  }) || [];

  const prevData = allData?.filter(d => {
    const date = parseISO(d.data_referencia);
    return isWithinInterval(date, { start: prevMonthStart, end: prevMonthEnd });
  }) || [];

  // Latest value per indicator for current month
  const latestByIndicator = currentData.reduce((acc, item) => {
    const key = item.localizacao ? `${item.indicador}|${item.localizacao}` : item.indicador;
    if (!acc[key] || new Date(item.data_referencia) > new Date(acc[key].data_referencia)) {
      acc[key] = item;
    }
    return acc;
  }, {} as Record<string, MarketData>);

  // Latest value per indicator for previous month
  const prevByIndicator = prevData.reduce((acc, item) => {
    const key = item.localizacao ? `${item.indicador}|${item.localizacao}` : item.indicador;
    if (!acc[key] || new Date(item.data_referencia) > new Date(acc[key].data_referencia)) {
      acc[key] = item;
    }
    return acc;
  }, {} as Record<string, MarketData>);

  const getVariation = (key: string) => {
    const curr = latestByIndicator[key]?.valor;
    const prev = prevByIndicator[key]?.valor;
    if (curr == null || prev == null || prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  const formatValue = (value: number | null, unit: string | null) => {
    if (value === null) return "N/D";
    if (unit === "USD/kg" || unit === "USD") return `$${value.toFixed(2)}`;
    if (unit === "AKZ/kg" || unit === "AKZ") return `${value.toLocaleString("pt-AO")} Kz`;
    if (unit === "ton" || unit === "kg") return `${value.toLocaleString("pt-AO")} ${unit}`;
    return value.toLocaleString("pt-AO") + (unit ? ` ${unit}` : "");
  };

  const indicators = Object.entries(latestByIndicator);
  const priceIndicators = indicators.filter(([, v]) =>
    v.indicador === "preco_spot" || v.indicador === "preco_futuro"
  );
  const productionIndicators = indicators.filter(([, v]) =>
    v.indicador === "producao" || v.indicador === "exportacao" || v.indicador === "consumo"
  );
  const otherIndicators = indicators.filter(([k]) =>
    !priceIndicators.some(([pk]) => pk === k) && !productionIndicators.some(([pk]) => pk === k)
  );

  const monthLabel = format(monthStart, "MMMM yyyy", { locale: pt });
  const prevMonthLabel = format(prevMonthStart, "MMMM yyyy", { locale: pt });

  const generatePDF = useCallback(() => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(89, 61, 35); // coffee brown
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("INCA Coffee Trace", 14, 18);
    doc.setFontSize(12);
    doc.text(`Boletim de Mercado — ${monthLabel}`, 14, 28);
    doc.setFontSize(8);
    doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 35);

    doc.setTextColor(0, 0, 0);
    let y = 50;

    // Summary
    doc.setFontSize(10);
    doc.text(`Período: ${monthLabel}`, 14, y);
    doc.text(`Referência anterior: ${prevMonthLabel}`, 14, y + 6);
    doc.text(`Total de indicadores: ${indicators.length}`, 14, y + 12);
    doc.text(`Registos no mês: ${currentData.length}`, 14, y + 18);
    y += 28;

    const buildRows = (items: [string, MarketData][]) =>
      items.map(([key, item]) => {
        const variation = getVariation(key);
        return [
          item.indicador,
          item.localizacao || "Nacional",
          formatValue(item.valor, item.unidade),
          variation !== null ? `${variation >= 0 ? "+" : ""}${variation.toFixed(1)}%` : "—",
          item.fonte,
          format(parseISO(item.data_referencia), "dd/MM/yyyy"),
        ];
      });

    const tableHead = [["Indicador", "Região", "Valor", "Var. Mensal", "Fonte", "Data"]];

    // Prices section
    if (priceIndicators.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(89, 61, 35);
      doc.text("Preços", 14, y);
      y += 4;
      doc.setTextColor(0, 0, 0);
      autoTable(doc, {
        startY: y,
        head: tableHead,
        body: buildRows(priceIndicators),
        theme: "striped",
        headStyles: { fillColor: [89, 61, 35] },
        styles: { fontSize: 8, cellPadding: 2 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Production section
    if (productionIndicators.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(89, 61, 35);
      doc.text("Produção", 14, y);
      y += 4;
      doc.setTextColor(0, 0, 0);
      autoTable(doc, {
        startY: y,
        head: tableHead,
        body: buildRows(productionIndicators),
        theme: "striped",
        headStyles: { fillColor: [55, 100, 30] },
        styles: { fontSize: 8, cellPadding: 2 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Other indicators
    if (otherIndicators.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(89, 61, 35);
      doc.text("Outros Indicadores", 14, y);
      y += 4;
      doc.setTextColor(0, 0, 0);
      autoTable(doc, {
        startY: y,
        head: tableHead,
        body: buildRows(otherIndicators),
        theme: "striped",
        headStyles: { fillColor: [70, 130, 180] },
        styles: { fontSize: 8, cellPadding: 2 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `INCA Coffee Trace — Instituto Nacional do Café de Angola • Página ${i}/${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }

    doc.save(`Boletim-Mercado-${selectedMonth}.pdf`);
  }, [indicators, priceIndicators, productionIndicators, otherIndicators, currentData, monthLabel, prevMonthLabel, selectedMonth]);

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
                <p className="text-xs text-muted-foreground">Portal Público • Boletim de Mercado</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/sim-publico">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  SIM
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
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-3">
                <Leaf className="h-3 w-3 mr-1" />
                Boletim Mensal
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Boletim de Mercado
              </h2>
              <p className="text-muted-foreground mt-1">
                Resumo mensal dos indicadores do sector cafeeiro angolano com variações e tendências.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={generatePDF} disabled={isLoading || indicators.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Indicadores" value={indicators.length} icon={<BarChart3 className="h-5 w-5 text-primary" />} loading={isLoading} />
          <SummaryCard label="Registos no mês" value={currentData.length} icon={<FileText className="h-5 w-5 text-primary" />} loading={isLoading} />
          <SummaryCard label="Regiões cobertas" value={new Set(currentData.filter(d => d.localizacao).map(d => d.localizacao)).size} icon={<MapPin className="h-5 w-5 text-primary" />} loading={isLoading} />
          <SummaryCard label="Fontes de dados" value={new Set(currentData.map(d => d.fonte)).size} icon={<Leaf className="h-5 w-5 text-primary" />} loading={isLoading} />
        </div>

        {/* Prices */}
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <>
            <IndicatorSection
              title="Preços"
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              items={priceIndicators}
              getVariation={getVariation}
              formatValue={formatValue}
            />
            <IndicatorSection
              title="Produção & Volumes"
              icon={<BarChart3 className="h-5 w-5 text-secondary" />}
              items={productionIndicators}
              getVariation={getVariation}
              formatValue={formatValue}
            />
            <IndicatorSection
              title="Outros Indicadores"
              icon={<FileText className="h-5 w-5 text-accent" />}
              items={otherIndicators}
              getVariation={getVariation}
              formatValue={formatValue}
            />

            {indicators.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-muted-foreground">Sem dados para {monthLabel}</p>
                  <p className="text-sm text-muted-foreground mt-1">Selecione outro mês ou aguarde a actualização dos dados.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link to="/sim-publico">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao SIM
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/verificar">Verificar Lote</Link>
          </Button>
        </div>
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

// -- Subcomponents --

const SummaryCard = ({ label, value, icon, loading }: { label: string; value: number; icon: React.ReactNode; loading: boolean }) => (
  <Card>
    <CardContent className="p-4 flex items-center gap-3">
      {icon}
      <div>
        {loading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold text-foreground">{value}</p>}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const IndicatorSection = ({
  title, icon, items, getVariation, formatValue,
}: {
  title: string;
  icon: React.ReactNode;
  items: [string, MarketData][];
  getVariation: (key: string) => number | null;
  formatValue: (v: number | null, u: string | null) => string;
}) => {
  if (items.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle>
        <CardDescription>{items.length} indicador(es) registado(s) neste mês</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 font-medium text-muted-foreground">Indicador</th>
                <th className="py-3 pr-4 font-medium text-muted-foreground">Valor</th>
                <th className="py-3 pr-4 font-medium text-muted-foreground hidden sm:table-cell">Região</th>
                <th className="py-3 pr-4 font-medium text-muted-foreground">Var. Mensal</th>
                <th className="py-3 pr-4 font-medium text-muted-foreground hidden md:table-cell">Fonte</th>
                <th className="py-3 font-medium text-muted-foreground">Data</th>
              </tr>
            </thead>
            <tbody>
              {items.map(([key, item]) => {
                const variation = getVariation(key);
                return (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">{item.indicador}</td>
                    <td className="py-3 pr-4 font-semibold text-foreground">{formatValue(item.valor, item.unidade)}</td>
                    <td className="py-3 pr-4 text-muted-foreground hidden sm:table-cell">{item.localizacao || "Nacional"}</td>
                    <td className="py-3 pr-4">
                      {variation !== null ? (
                        <Badge variant={variation >= 0 ? "secondary" : "destructive"} className="text-xs gap-1">
                          {variation >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {variation >= 0 ? "+" : ""}{variation.toFixed(1)}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground hidden md:table-cell">{item.fonte}</td>
                    <td className="py-3 text-muted-foreground text-xs">{format(parseISO(item.data_referencia), "dd/MM/yyyy")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BoletimMercado;
