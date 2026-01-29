import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  ArrowRight,
  Coffee
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";

interface MarketData {
  id: string;
  indicador: string;
  valor: number | null;
  unidade: string | null;
  fonte: string;
  localizacao: string | null;
  data_referencia: string;
}

export const MarketDataWidget = () => {
  const { data: marketData, isLoading } = useQuery({
    queryKey: ["dashboard-market-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sim_mercado")
        .select("*")
        .order("data_referencia", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as MarketData[];
    },
  });

  // Get unique indicators with latest values
  const latestByIndicator = marketData?.reduce((acc, item) => {
    if (!acc[item.indicador] || new Date(item.data_referencia) > new Date(acc[item.indicador].data_referencia)) {
      acc[item.indicador] = item;
    }
    return acc;
  }, {} as Record<string, MarketData>) || {};

  const indicators = Object.values(latestByIndicator).slice(0, 4);

  // Calculate trends (simplified - comparing to any previous value)
  const getTrend = (indicador: string, currentValue: number | null) => {
    if (!currentValue || !marketData) return null;
    const previousValues = marketData
      .filter(m => m.indicador === indicador && m.valor !== currentValue)
      .sort((a, b) => new Date(b.data_referencia).getTime() - new Date(a.data_referencia).getTime());
    
    if (previousValues.length === 0 || !previousValues[0].valor) return null;
    
    const previousValue = previousValues[0].valor;
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return { change, previousValue };
  };

  const formatValue = (value: number | null, unit: string | null) => {
    if (value === null) return "N/D";
    if (unit === "USD/kg" || unit === "USD") {
      return `$${value.toFixed(2)}`;
    }
    if (unit === "kg" || unit === "ton") {
      return value.toLocaleString("pt-AO") + " " + unit;
    }
    return value.toLocaleString("pt-AO") + (unit ? ` ${unit}` : "");
  };

  const getIndicatorIcon = (indicador: string) => {
    if (indicador.toLowerCase().includes("preço") || indicador.toLowerCase().includes("price")) {
      return <DollarSign className="h-5 w-5 text-secondary" />;
    }
    if (indicador.toLowerCase().includes("volume") || indicador.toLowerCase().includes("produção")) {
      return <BarChart3 className="h-5 w-5 text-primary" />;
    }
    return <Coffee className="h-5 w-5 text-accent" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Dados de Mercado (SIM)
          </CardTitle>
          <CardDescription>
            Preços e indicadores actuais do café
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/sim">Ver Mais</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {indicators.length > 0 ? (
          <>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {indicators.map((item) => {
                const trend = getTrend(item.indicador, item.valor);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getIndicatorIcon(item.indicador)}
                      <p className="text-sm font-medium truncate">{item.indicador}</p>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xl font-bold">
                          {formatValue(item.valor, item.unidade)}
                        </p>
                        {item.localizacao && (
                          <p className="text-xs text-muted-foreground">{item.localizacao}</p>
                        )}
                      </div>
                      {trend && (
                        <div className={`flex items-center gap-1 text-xs ${
                          trend.change >= 0 ? "text-secondary" : "text-destructive"
                        }`}>
                          {trend.change >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span>{trend.change >= 0 ? "+" : ""}{trend.change.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(item.data_referencia), "dd MMM yyyy", { locale: pt })} • {item.fonte}
                    </p>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/sim">
                Explorar Mercado
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sem dados de mercado disponíveis</p>
            <Button variant="link" size="sm" asChild>
              <Link to="/sim">Adicionar Dados</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketDataWidget;
