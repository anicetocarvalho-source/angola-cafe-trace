import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, MapPin, Calendar, Droplets, Thermometer, Search, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface LoteInfo {
  referencia_lote: string;
  tipo: string;
  volume_kg: number;
  humidade_percent: number | null;
  temperatura_c: number | null;
  classificacao_sensorial: number | null;
  estado: string;
  created_at: string;
  colheitas: {
    campanha: string;
    parcelas: {
      codigo_parcela: string;
      exploracoes: {
        designacao: string;
        provincia: string;
        municipio: string;
        latitude: number | null;
        longitude: number | null;
      };
    };
  } | null;
}

const Verificar = () => {
  const { referencia } = useParams();
  const navigate = useNavigate();
  const [searchRef, setSearchRef] = useState(referencia || "");
  const [lote, setLote] = useState<LoteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchRef.trim()) {
      toast.error("Por favor, insira uma referência de lote");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from("lotes")
        .select(`
          *,
          colheitas (
            campanha,
            parcelas (
              codigo_parcela,
              exploracoes (
                designacao,
                provincia,
                municipio,
                latitude,
                longitude
              )
            )
          )
        `)
        .eq("referencia_lote", searchRef.trim().toUpperCase())
        .or("estado.eq.aprovado,estado.eq.exportado")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Lote não encontrado ou não está aprovado para visualização pública");
        setLote(null);
      } else {
        setLote(data as LoteInfo);
      }
    } catch (error: any) {
      console.error("Error fetching lote:", error);
      toast.error("Erro ao buscar informações do lote");
      setLote(null);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "aprovado":
        return <Badge className="bg-secondary">Aprovado</Badge>;
      case "exportado":
        return <Badge className="bg-primary">Exportado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      cereja: "Cereja",
      cafe_verde: "Café Verde",
      parchment: "Pergaminho",
      torrado: "Torrado",
      moido: "Moído",
    };
    return labels[tipo] || tipo;
  };

  const getQualityColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 85) return "text-secondary";
    if (score >= 80) return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">INCA Coffee Trace</span>
            </div>
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Verificar Lote de Café</h1>
            <p className="text-lg text-muted-foreground">
              Descubra a origem e qualidade do seu café angolano
            </p>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Insira a referência (ex: LOT-2024-123456)"
                    value={searchRef}
                    onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="text-center"
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {searched && !lote && !loading && (
            <Card className="border-destructive">
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Nenhum lote encontrado com esta referência ou o lote ainda não está aprovado para visualização pública.
                </p>
              </CardContent>
            </Card>
          )}

          {lote && (
            <div className="space-y-6">
              {/* Main Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{lote.referencia_lote}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {getTipoLabel(lote.tipo)} • {lote.volume_kg} kg
                      </CardDescription>
                    </div>
                    {getEstadoBadge(lote.estado)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Data de Registo</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(lote.created_at).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </div>

                    {lote.colheitas && (
                      <div className="flex items-center gap-3">
                        <Coffee className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Campanha</p>
                          <p className="text-sm text-muted-foreground">{lote.colheitas.campanha}</p>
                        </div>
                      </div>
                    )}

                    {lote.humidade_percent !== null && (
                      <div className="flex items-center gap-3">
                        <Droplets className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Humidade</p>
                          <p className="text-sm text-muted-foreground">{lote.humidade_percent}%</p>
                        </div>
                      </div>
                    )}

                    {lote.temperatura_c !== null && (
                      <div className="flex items-center gap-3">
                        <Thermometer className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Temperatura</p>
                          <p className="text-sm text-muted-foreground">{lote.temperatura_c}°C</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quality Score */}
              {lote.classificacao_sensorial !== null && (
                <Card>
                  <CardHeader>
                    <CardTitle>Classificação Sensorial (SCA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className={`text-6xl font-bold ${getQualityColor(lote.classificacao_sensorial)}`}>
                          {lote.classificacao_sensorial}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {lote.classificacao_sensorial >= 85
                            ? "Qualidade Excepcional"
                            : lote.classificacao_sensorial >= 80
                            ? "Muito Bom"
                            : "Bom"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Origin */}
              {lote.colheitas?.parcelas && (
                <Card>
                  <CardHeader>
                    <CardTitle>Origem</CardTitle>
                    <CardDescription>Informações sobre a exploração agrícola</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{lote.colheitas.parcelas.exploracoes.designacao}</p>
                        <p className="text-sm text-muted-foreground">
                          {lote.colheitas.parcelas.exploracoes.municipio},{" "}
                          {lote.colheitas.parcelas.exploracoes.provincia}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Parcela: {lote.colheitas.parcelas.codigo_parcela}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Traceability Note */}
              <Card className="bg-secondary/10 border-secondary">
                <CardContent className="pt-6">
                  <p className="text-sm text-center text-muted-foreground">
                    Este lote foi rastreado através do sistema INCA Coffee Trace, garantindo
                    transparência e qualidade desde a origem até ao consumidor.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verificar;
