import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, FileCheck, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QualidadeCert {
  id: string;
  lote_id: string;
  tipo: string;
  resultado: string;
  certificacoes_emitidas: string[];
  created_at: string;
  lotes: {
    referencia_lote: string;
  };
}

const Qualidade = () => {
  const [certificacoes, setCertificacoes] = useState<QualidadeCert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificacoes();
  }, []);

  const fetchCertificacoes = async () => {
    try {
      const { data, error } = await supabase
        .from("qualidade_certificacoes")
        .select(`
          *,
          lotes (
            referencia_lote
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCertificacoes(data as any || []);
    } catch (error) {
      console.error("Error fetching certificacoes:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      fisico: "Físico",
      sensorial: "Sensorial",
      quimico: "Químico",
      residuos: "Resíduos",
    };
    return labels[tipo] || tipo;
  };

  const getResultadoBadge = (resultado: string) => {
    return resultado === "aprovado" ? (
      <Badge className="bg-secondary">Aprovado</Badge>
    ) : (
      <Badge className="bg-destructive">Reprovado</Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controlo de Qualidade</h1>
            <p className="text-muted-foreground">
              Análises laboratoriais e certificações
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Análise
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Análises Realizadas</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificacoes.length}</div>
              <p className="text-xs text-muted-foreground">Total no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificações Emitidas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificacoes.filter((c) => c.certificacoes_emitidas?.length > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">UTZ, RA, FT, Orgânico</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <FileCheck className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificacoes.length > 0
                  ? Math.round(
                      (certificacoes.filter((c) => c.resultado === "aprovado").length /
                        certificacoes.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Lotes aprovados</p>
            </CardContent>
          </Card>
        </div>

        {/* Certifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Análises de Qualidade</CardTitle>
            <CardDescription>
              Histórico de análises e certificações emitidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar...</p>
            ) : certificacoes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Ainda não há análises de qualidade registadas
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lote</TableHead>
                      <TableHead>Tipo de Análise</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead>Certificações</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificacoes.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">
                          {cert.lotes?.referencia_lote || "N/A"}
                        </TableCell>
                        <TableCell>{getTipoLabel(cert.tipo)}</TableCell>
                        <TableCell>{getResultadoBadge(cert.resultado)}</TableCell>
                        <TableCell>
                          {cert.certificacoes_emitidas?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {cert.certificacoes_emitidas.map((c, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(cert.created_at).toLocaleDateString("pt-PT")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certification Standards Info */}
        <Card className="border-secondary/50">
          <CardHeader>
            <CardTitle>Certificações Suportadas</CardTitle>
            <CardDescription>Normas e padrões de qualidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">UTZ Certified</p>
                <p className="text-xs text-muted-foreground">Agricultura sustentável</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">Rainforest Alliance</p>
                <p className="text-xs text-muted-foreground">Conservação ambiental</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">FairTrade</p>
                <p className="text-xs text-muted-foreground">Comércio justo</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">Orgânico</p>
                <p className="text-xs text-muted-foreground">Produção biológica</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">DOC Angola</p>
                <p className="text-xs text-muted-foreground">Denominação de origem</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">EUDR Ready</p>
                <p className="text-xs text-muted-foreground">Conformidade UE</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Qualidade;
