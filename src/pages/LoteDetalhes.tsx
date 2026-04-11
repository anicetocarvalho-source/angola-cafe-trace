import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, MapPin, Activity, FileText, Calendar, Clock, GitBranch } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import LoteTimeline from "@/components/LoteTimeline";
import LoteGenealogy from "@/components/LoteGenealogy";
import SCARadarChart from "@/components/SCARadarChart";
import SCAScoreForm from "@/components/SCAScoreForm";

interface LoteDetalhado {
  id: string;
  referencia_lote: string;
  tipo: string;
  volume_kg: number;
  estado: string;
  classificacao_sensorial: number | null;
  humidade_percent: number | null;
  temperatura_c: number | null;
  sca_aroma: number | null;
  sca_acidez: number | null;
  sca_corpo: number | null;
  sca_sabor: number | null;
  sca_aftertaste: number | null;
  sca_uniformidade: number | null;
  sca_balance: number | null;
  sca_clean_cup: number | null;
  sca_sweetness: number | null;
  sca_overall: number | null;
  notas_sensoriais: string | null;
  created_at: string;
  colheitas: {
    campanha: string;
    data_inicio: string;
    parcelas: {
      codigo_parcela: string;
      exploracoes: {
        designacao: string;
        provincia: string;
        municipio: string;
      };
    };
  } | null;
  secagens: Array<{
    metodo: string;
    data_inicio: string;
    data_fim: string | null;
    humidade_final_percent: number | null;
  }>;
  qualidade_certificacoes: Array<{
    tipo: string;
    resultado: string;
    certificacoes_emitidas: string[];
    created_at: string;
  }>;
}

const LoteDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lote, setLote] = useState<LoteDetalhado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoteDetails();
  }, [id]);

  const fetchLoteDetails = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("lotes")
        .select(`
          *,
          colheitas (
            campanha,
            data_inicio,
            parcelas (
              codigo_parcela,
              exploracoes (
                designacao,
                provincia,
                municipio
              )
            )
          ),
          secagens (*),
          qualidade_certificacoes (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setLote(data as LoteDetalhado);
    } catch (error) {
      console.error("Error fetching lote details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      pendente: "bg-accent",
      aprovado: "bg-secondary",
      reprovado: "bg-destructive",
      exportado: "bg-primary",
    };
    return <Badge className={variants[estado] || "bg-muted"}>{estado}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!lote) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Lote não encontrado</p>
          <Button onClick={() => navigate("/lotes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/lotes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{lote.referencia_lote}</h1>
            <p className="text-muted-foreground">Detalhes completos do lote</p>
          </div>
          {getEstadoBadge(lote.estado)}
        </div>

        {/* Main Info */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipo</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lote.tipo}</div>
              <p className="text-xs text-muted-foreground">{lote.volume_kg} kg</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualidade SCA</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lote.classificacao_sensorial || "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                {lote.classificacao_sensorial && lote.classificacao_sensorial >= 85
                  ? "Excepcional"
                  : lote.classificacao_sensorial && lote.classificacao_sensorial >= 80
                  ? "Muito Bom"
                  : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Humidade</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lote.humidade_percent ? `${lote.humidade_percent}%` : "-"}
              </div>
              <p className="text-xs text-muted-foreground">
                Ideal: 10-12%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="timeline" className="space-y-4">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="genealogia">Genealogia</TabsTrigger>
            <TabsTrigger value="origem">Origem</TabsTrigger>
            <TabsTrigger value="processamento">Processamento</TabsTrigger>
            <TabsTrigger value="sensorial">Sensorial SCA</TabsTrigger>
            <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <LoteTimeline loteId={lote.id} />
          </TabsContent>

          <TabsContent value="genealogia">
            <LoteGenealogy loteId={lote.id} />
          </TabsContent>

          <TabsContent value="sensorial" className="space-y-4">
            <SCARadarChart lote={lote} />
            <SCAScoreForm
              loteId={lote.id}
              initialValues={{
                sca_aroma: lote.sca_aroma,
                sca_acidez: lote.sca_acidez,
                sca_corpo: lote.sca_corpo,
                sca_sabor: lote.sca_sabor,
                sca_aftertaste: lote.sca_aftertaste,
                sca_uniformidade: lote.sca_uniformidade,
                sca_balance: lote.sca_balance,
                sca_clean_cup: lote.sca_clean_cup,
                sca_sweetness: lote.sca_sweetness,
                sca_overall: lote.sca_overall,
              }}
              initialNotes={lote.notas_sensoriais}
              onSaved={() => fetchLoteDetails()}
            />
          </TabsContent>

          <TabsContent value="origem">
            <Card>
              <CardHeader>
                <CardTitle>Rastreabilidade</CardTitle>
                <CardDescription>Origem e colheita do lote</CardDescription>
              </CardHeader>
              <CardContent>
                {lote.colheitas ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {lote.colheitas.parcelas.exploracoes.designacao}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Parcela: {lote.colheitas.parcelas.codigo_parcela}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lote.colheitas.parcelas.exploracoes.municipio},{" "}
                          {lote.colheitas.parcelas.exploracoes.provincia}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Campanha {lote.colheitas.campanha}</p>
                        <p className="text-sm text-muted-foreground">
                          Colheita em{" "}
                          {new Date(lote.colheitas.data_inicio).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sem informação de origem registada</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processamento">
            <Card>
              <CardHeader>
                <CardTitle>Processos de Secagem</CardTitle>
                <CardDescription>
                  {lote.secagens.length} processos registados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lote.secagens.length > 0 ? (
                  <div className="space-y-3">
                    {lote.secagens.map((secagem, idx) => (
                      <div key={idx} className="border-l-2 border-primary pl-4 py-2">
                        <p className="font-medium">{secagem.metodo}</p>
                        <p className="text-sm text-muted-foreground">
                          Início: {new Date(secagem.data_inicio).toLocaleDateString("pt-PT")}
                        </p>
                        {secagem.data_fim && (
                          <p className="text-sm text-muted-foreground">
                            Fim: {new Date(secagem.data_fim).toLocaleDateString("pt-PT")}
                          </p>
                        )}
                        {secagem.humidade_final_percent && (
                          <p className="text-sm">
                            Humidade final: {secagem.humidade_final_percent}%
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sem processos de secagem registados</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualidade">
            <Card>
              <CardHeader>
                <CardTitle>Análises de Qualidade</CardTitle>
                <CardDescription>
                  {lote.qualidade_certificacoes.length} análises realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lote.qualidade_certificacoes.length > 0 ? (
                  <div className="space-y-3">
                    {lote.qualidade_certificacoes.map((cert, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{cert.tipo}</p>
                          <Badge
                            className={
                              cert.resultado === "aprovado"
                                ? "bg-secondary"
                                : "bg-destructive"
                            }
                          >
                            {cert.resultado}
                          </Badge>
                        </div>
                        {cert.certificacoes_emitidas.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {cert.certificacoes_emitidas.map((c, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(cert.created_at).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sem análises de qualidade registadas</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos">
            <Card>
              <CardHeader>
                <CardTitle>Documentos do Lote</CardTitle>
                <CardDescription>
                  Certificados, análises e outros documentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  bucket="lot-documents"
                  folder={lote.id}
                  onUploadComplete={(url) => {
                    console.log("File uploaded:", url);
                  }}
                  accept="application/pdf,image/*"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LoteDetalhes;
