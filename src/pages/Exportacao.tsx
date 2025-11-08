import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ship, FileText, Plus, Package, Eye } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Exportacao = () => {
  const navigate = useNavigate();

  const { data: lotes, isLoading: lotesLoading } = useQuery({
    queryKey: ['lotes-aprovados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotes")
        .select("*")
        .eq("estado", "aprovado")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: exportacoes, isLoading: exportacoesLoading } = useQuery({
    queryKey: ['exportacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exportacoes")
        .select(`
          *,
          exportador:entities!exportacoes_exportador_id_fkey(nome_legal)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const loading = lotesLoading || exportacoesLoading;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      preparacao: { variant: "secondary", label: "Preparação" },
      documentacao: { variant: "default", label: "Documentação" },
      embarque: { variant: "default", label: "Embarque" },
      transito: { variant: "default", label: "Em Trânsito" },
      exportado: { variant: "default", label: "Exportado" },
    };

    const config = variants[status] || variants.preparacao;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Exportações</h1>
            <p className="text-muted-foreground">
              Preparar e gerir exportações de café certificado
            </p>
          </div>
          <Button onClick={() => navigate("/nova-exportacao")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Exportação
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lotes Disponíveis</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lotes.length}</div>
              <p className="text-xs text-muted-foreground">Aprovados para exportação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Processo</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exportacoes?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Exportações registadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">BL, DU, Certificados</p>
            </CardContent>
          </Card>
        </div>

        {/* Exportações Ativas */}
        {exportacoes && exportacoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Exportações Ativas</CardTitle>
              <CardDescription>Gerir exportações em curso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exportacoes.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {exp.exportador?.nome_legal}
                        </p>
                        {getStatusBadge(exp.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {exp.pais_destino} • {exp.lote_ids?.length || 0} lotes
                        {exp.booking && ` • Booking: ${exp.booking}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/exportacao/${exp.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Lots for Export */}
        <Card>
          <CardHeader>
            <CardTitle>Lotes Aprovados para Exportação</CardTitle>
            <CardDescription>
              Seleccione lotes para criar uma exportação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar...</p>
            ) : lotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Não há lotes aprovados disponíveis para exportação
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referência</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Volume (kg)</TableHead>
                      <TableHead>SCA Score</TableHead>
                      <TableHead>Humidade</TableHead>
                      <TableHead className="text-right">Acção</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotes.map((lote) => (
                      <TableRow key={lote.id}>
                        <TableCell className="font-medium">
                          {lote.referencia_lote}
                        </TableCell>
                        <TableCell>{lote.tipo}</TableCell>
                        <TableCell>{lote.volume_kg}</TableCell>
                        <TableCell>
                          {lote.classificacao_sensorial ? (
                            <span className="font-semibold text-secondary">
                              {lote.classificacao_sensorial}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {lote.humidade_percent ? `${lote.humidade_percent}%` : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* EUDR Compliance */}
        <Card className="border-secondary/50">
          <CardHeader>
            <CardTitle>Conformidade EUDR</CardTitle>
            <CardDescription>
              Regulamento da União Europeia sobre Desmatamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                <div>
                  <p className="font-medium">Lotes EUDR-Ready</p>
                  <p className="text-sm text-muted-foreground">
                    Com geolocalização e certificação completa
                  </p>
                </div>
                <Badge className="bg-secondary">
                  {lotes.filter((l) => l.classificacao_sensorial && l.humidade_percent).length}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Para exportação para a UE, os lotes devem ter origem rastreável,
                coordenadas GPS da exploração e certificação de qualidade.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Exportacao;
