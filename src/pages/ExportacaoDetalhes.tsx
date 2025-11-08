import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Ship, FileText, Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ExportacaoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState("");

  const { data: exportacao, isLoading } = useQuery({
    queryKey: ['exportacao', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exportacoes')
        .select(`
          *,
          exportador:entities!exportacoes_exportador_id_fkey(nome_legal)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: lotes } = useQuery({
    queryKey: ['exportacao-lotes', exportacao?.lote_ids],
    queryFn: async () => {
      if (!exportacao?.lote_ids) return [];
      
      const { data, error } = await supabase
        .from('lotes')
        .select('*')
        .in('id', exportacao.lote_ids);

      if (error) throw error;
      return data;
    },
    enabled: !!exportacao?.lote_ids,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase
        .from('exportacoes')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportacao', id] });
      toast.success("Estado atualizado com sucesso!");
      
      // Create notification for status change
      if (exportacao) {
        supabase.from('notifications').insert({
          user_id: exportacao.exportador_id,
          title: "Exportação Atualizada",
          message: `O estado da exportação foi alterado para ${getStatusLabel(newStatus)}`,
          type: "info",
          link: `/exportacao/${id}`
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: any; label: string; variant: any }> = {
      preparacao: { icon: Clock, label: "Preparação", variant: "secondary" },
      documentacao: { icon: FileText, label: "Documentação", variant: "default" },
      embarque: { icon: Ship, label: "Embarque", variant: "default" },
      transito: { icon: Ship, label: "Em Trânsito", variant: "default" },
      exportado: { icon: CheckCircle, label: "Exportado", variant: "default" },
    };

    const config = configs[status] || configs.preparacao;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      preparacao: "Preparação",
      documentacao: "Documentação",
      embarque: "Embarque",
      transito: "Em Trânsito",
      exportado: "Exportado",
    };
    return labels[status] || status;
  };

  const volumeTotal = lotes?.reduce((sum, lote) => sum + Number(lote.volume_kg), 0) || 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!exportacao) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Exportação não encontrada</p>
          <Button onClick={() => navigate('/exportacao')}>Voltar</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/exportacao')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Exportação #{exportacao.booking || 'Sem Booking'}</h1>
                {getStatusBadge(exportacao.status)}
              </div>
              <p className="text-muted-foreground">
                {exportacao.exportador?.nome_legal} → {exportacao.pais_destino}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={newStatus || exportacao.status} onValueChange={(value) => {
              setNewStatus(value);
              updateStatusMutation.mutate(value);
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preparacao">Preparação</SelectItem>
                <SelectItem value="documentacao">Documentação</SelectItem>
                <SelectItem value="embarque">Embarque</SelectItem>
                <SelectItem value="transito">Em Trânsito</SelectItem>
                <SelectItem value="exportado">Exportado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Total de Lotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lotes?.length || 0}</div>
              <p className="text-xs text-muted-foreground">{volumeTotal.toFixed(0)} kg</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ship className="h-4 w-4 text-muted-foreground" />
                Informação de Embarque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{exportacao.navio || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                {exportacao.porto || 'Porto não especificado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Documentação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p>BL: {exportacao.bl_ref || '-'}</p>
                <p>DU: {exportacao.du_ref || '-'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lotes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lotes">Lotes</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="lotes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lotes Incluídos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lotes?.map((lote) => (
                    <div
                      key={lote.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{lote.referencia_lote}</p>
                        <p className="text-sm text-muted-foreground">
                          {lote.tipo} • {lote.volume_kg} kg
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/lotes/${lote.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentos de Exportação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Certificado de Origem</h3>
                  <FileUpload
                    bucket="certificates"
                    onUploadComplete={(url) => {
                      supabase
                        .from('exportacoes')
                        .update({ certificado_origem_url: url })
                        .eq('id', id);
                      toast.success("Certificado carregado!");
                    }}
                  />
                  {exportacao.certificado_origem_url && (
                    <a
                      href={exportacao.certificado_origem_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Ver certificado carregado
                    </a>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Invoice</h3>
                  <FileUpload
                    bucket="certificates"
                    onUploadComplete={(url) => {
                      supabase
                        .from('exportacoes')
                        .update({ invoice_url: url })
                        .eq('id', id);
                      toast.success("Invoice carregada!");
                    }}
                  />
                  {exportacao.invoice_url && (
                    <a
                      href={exportacao.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Ver invoice carregada
                    </a>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Packing List</h3>
                  <FileUpload
                    bucket="certificates"
                    onUploadComplete={(url) => {
                      supabase
                        .from('exportacoes')
                        .update({ packing_list_url: url })
                        .eq('id', id);
                      toast.success("Packing list carregado!");
                    }}
                  />
                  {exportacao.packing_list_url && (
                    <a
                      href={exportacao.packing_list_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline mt-2 inline-block"
                    >
                      Ver packing list carregado
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tracking do Container</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Booking: {exportacao.booking || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        BL: {exportacao.bl_ref || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {exportacao.data_embarque && (
                    <div className="border-l-2 border-primary pl-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium">Data de Embarque</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(exportacao.data_embarque).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    Para tracking em tempo real, consulte a transportadora marítima.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Completas</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Exportador</dt>
                    <dd className="mt-1">{exportacao.exportador?.nome_legal}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">País de Destino</dt>
                    <dd className="mt-1">{exportacao.pais_destino}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Porto</dt>
                    <dd className="mt-1">{exportacao.porto || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Navio</dt>
                    <dd className="mt-1">{exportacao.navio || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Booking</dt>
                    <dd className="mt-1">{exportacao.booking || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Data de Embarque</dt>
                    <dd className="mt-1">
                      {exportacao.data_embarque
                        ? new Date(exportacao.data_embarque).toLocaleDateString('pt-PT')
                        : '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">EUDR Package ID</dt>
                    <dd className="mt-1">{exportacao.eudr_pacote_id || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                    <dd className="mt-1">{getStatusBadge(exportacao.status)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
