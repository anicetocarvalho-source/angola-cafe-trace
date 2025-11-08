import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Globe } from "lucide-react";

const SIM = () => {
  // Mock data for market information
  const marketData = {
    precoSpotUSD: 4.85,
    precoSpotAKZ: 4250,
    variacao: "+2.3%",
    volumeExportacao2024: "12,450",
    volumeProducao2024: "28,000",
    destinosTop: ["Portugal", "Alemanha", "EUA", "Bélgica"],
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            SIM - Sistema de Informação de Mercado
          </h1>
          <p className="text-muted-foreground">
            Dados e estatísticas sobre o mercado do café angolano
          </p>
        </div>

        {/* Price Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preço Spot (USD)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${marketData.precoSpotUSD}</div>
              <p className="text-xs text-secondary">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {marketData.variacao} vs semana anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preço Spot (AKZ)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketData.precoSpotAKZ} Kz</div>
              <p className="text-xs text-muted-foreground">Por kg (café verde)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produção 2024</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketData.volumeProducao2024}</div>
              <p className="text-xs text-muted-foreground">Toneladas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exportação 2024</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketData.volumeExportacao2024}</div>
              <p className="text-xs text-muted-foreground">Toneladas</p>
            </CardContent>
          </Card>
        </div>

        {/* Market Trends */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Preços</CardTitle>
              <CardDescription>Últimos 6 meses (USD/kg)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p>Gráfico de evolução de preços</p>
                  <p className="text-xs">(em desenvolvimento)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Principais Destinos</CardTitle>
              <CardDescription>Exportações por país (2024)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketData.destinosTop.map((pais, idx) => (
                  <div key={pais} className="flex items-center justify-between">
                    <span className="font-medium">{pais}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-primary rounded-full" style={{ width: `${100 - idx * 20}px` }} />
                      <span className="text-sm text-muted-foreground">{100 - idx * 15}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Mercado</CardTitle>
            <CardDescription>Dados actualizados diariamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Bolsa ICE (Arábica)</p>
                  <p className="text-2xl font-bold">$2.15</p>
                  <p className="text-xs text-secondary">+1.8%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Bolsa ICE (Robusta)</p>
                  <p className="text-2xl font-bold">$2.45</p>
                  <p className="text-xs text-secondary">+0.5%</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Taxa Câmbio USD/AKZ</p>
                  <p className="text-2xl font-bold">876.50</p>
                  <p className="text-xs text-muted-foreground">Estável</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Última actualização: {new Date().toLocaleString("pt-PT")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SIM;
