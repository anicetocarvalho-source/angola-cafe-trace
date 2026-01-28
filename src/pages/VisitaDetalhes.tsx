import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Play, CheckCircle, XCircle, Edit, MapPin, Calendar, User, Camera } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import PhotoGalleryUpload from "@/components/PhotoGalleryUpload";

type VisitStatus = "agendada" | "em_curso" | "realizada" | "cancelada";
type ActionStatus = "pendente" | "em_curso" | "concluida" | "nao_cumprida";

const estadoLabels: Record<VisitStatus, string> = {
  agendada: "Agendada",
  em_curso: "Em Curso",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

const estadoColors: Record<VisitStatus, string> = {
  agendada: "bg-blue-100 text-blue-800",
  em_curso: "bg-yellow-100 text-yellow-800",
  realizada: "bg-green-100 text-green-800",
  cancelada: "bg-gray-100 text-gray-800",
};

const acaoEstadoLabels: Record<ActionStatus, string> = {
  pendente: "Pendente",
  em_curso: "Em Curso",
  concluida: "Concluída",
  nao_cumprida: "Não Cumprida",
};

const acaoEstadoColors: Record<ActionStatus, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  em_curso: "bg-blue-100 text-blue-800",
  concluida: "bg-green-100 text-green-800",
  nao_cumprida: "bg-red-100 text-red-800",
};

const tipoLabels: Record<string, string> = {
  rotina: "Rotina",
  fiscalizacao: "Fiscalização",
  acompanhamento: "Acompanhamento",
  emergencia: "Emergência",
};

const VisitaDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newAction, setNewAction] = useState({
    tipo: "",
    descricao: "",
    prazo: "",
    responsavel: "",
  });
  const [editData, setEditData] = useState({
    conformidade_geral: "",
    observacoes: "",
  });

  const { data: visita, isLoading } = useQuery({
    queryKey: ["visita-tecnica", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitas_tecnicas")
        .select(`
          *,
          exploracoes (
            designacao,
            provincia,
            municipio,
            comuna,
            aldeia
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: acoes } = useQuery({
    queryKey: ["acoes-controlo", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acoes_controlo")
        .select("*")
        .eq("visita_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateEstadoMutation = useMutation({
    mutationFn: async (novoEstado: VisitStatus) => {
      const { error } = await supabase
        .from("visitas_tecnicas")
        .update({ estado: novoEstado })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visita-tecnica", id] });
      toast({
        title: "Estado actualizado",
        description: "O estado da visita foi actualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível actualizar o estado.",
        variant: "destructive",
      });
    },
  });

  const updateVisitaMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("visitas_tecnicas")
        .update({
          conformidade_geral: editData.conformidade_geral || null,
          observacoes: editData.observacoes || null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visita-tecnica", id] });
      setIsEditOpen(false);
      toast({
        title: "Visita actualizada",
        description: "Os dados da visita foram actualizados.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível actualizar a visita.",
        variant: "destructive",
      });
    },
  });

  const updatePhotosMutation = useMutation({
    mutationFn: async (fotos_urls: string[]) => {
      const { error } = await supabase
        .from("visitas_tecnicas")
        .update({ fotos_urls })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visita-tecnica", id] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível guardar as fotos.",
        variant: "destructive",
      });
    },
  });

  const addAcaoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("acoes_controlo").insert({
        visita_id: id,
        tipo: newAction.tipo,
        descricao: newAction.descricao,
        prazo: newAction.prazo || null,
        responsavel: newAction.responsavel || null,
        estado: "pendente",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acoes-controlo", id] });
      setIsAddActionOpen(false);
      setNewAction({ tipo: "", descricao: "", prazo: "", responsavel: "" });
      toast({
        title: "Ação adicionada",
        description: "A ação de controlo foi registada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a ação.",
        variant: "destructive",
      });
    },
  });

  const updateAcaoEstadoMutation = useMutation({
    mutationFn: async ({
      acaoId,
      novoEstado,
    }: {
      acaoId: string;
      novoEstado: ActionStatus;
    }) => {
      const updateData: Record<string, unknown> = { estado: novoEstado };
      if (novoEstado === "concluida") {
        updateData.data_conclusao = new Date().toISOString().split("T")[0];
      }

      const { error } = await supabase
        .from("acoes_controlo")
        .update(updateData)
        .eq("id", acaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acoes-controlo", id] });
      toast({
        title: "Estado actualizado",
        description: "O estado da ação foi actualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível actualizar o estado da ação.",
        variant: "destructive",
      });
    },
  });

  const handleOpenEdit = () => {
    setEditData({
      conformidade_geral: visita?.conformidade_geral || "",
      observacoes: visita?.observacoes || "",
    });
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!visita) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Visita não encontrada.</p>
          <Button asChild className="mt-4">
            <Link to="/fiscalizacao">Voltar</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/fiscalizacao">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Visita Técnica
              </h1>
              <p className="text-muted-foreground">
                {visita.exploracoes?.designacao}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {visita.estado === "agendada" && (
              <Button
                variant="outline"
                onClick={() => updateEstadoMutation.mutate("em_curso")}
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Visita
              </Button>
            )}
            {visita.estado === "em_curso" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => updateEstadoMutation.mutate("realizada")}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluir
                </Button>
                <Button
                  variant="outline"
                  onClick={handleOpenEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Registar Observações
                </Button>
              </>
            )}
            {visita.estado === "agendada" && (
              <Button
                variant="destructive"
                onClick={() => updateEstadoMutation.mutate("cancelada")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* Visit Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Detalhes da Visita
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    estadoColors[visita.estado as VisitStatus]
                  }`}
                >
                  {estadoLabels[visita.estado as VisitStatus]}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(visita.data_visita), "dd 'de' MMMM 'de' yyyy", {
                    locale: pt,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {visita.exploracoes?.aldeia && `${visita.exploracoes.aldeia}, `}
                  {visita.exploracoes?.comuna && `${visita.exploracoes.comuna}, `}
                  {visita.exploracoes?.municipio}, {visita.exploracoes?.provincia}
                </span>
              </div>
              <div>
                <Badge variant="outline">{tipoLabels[visita.tipo]}</Badge>
              </div>
              {visita.objetivo && (
                <div>
                  <Label className="text-muted-foreground">Objetivo</Label>
                  <p className="mt-1">{visita.objetivo}</p>
                </div>
              )}
              {visita.observacoes && (
                <div>
                  <Label className="text-muted-foreground">Observações</Label>
                  <p className="mt-1">{visita.observacoes}</p>
                </div>
              )}
              {visita.conformidade_geral && (
                <div>
                  <Label className="text-muted-foreground">Conformidade Geral</Label>
                  <p className="mt-1">{visita.conformidade_geral}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exploração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Designação</Label>
                <p className="font-medium">{visita.exploracoes?.designacao}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Província</Label>
                <p>{visita.exploracoes?.provincia}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Município</Label>
                <p>{visita.exploracoes?.municipio}</p>
              </div>
              {visita.exploracoes?.comuna && (
                <div>
                  <Label className="text-muted-foreground">Comuna</Label>
                  <p>{visita.exploracoes.comuna}</p>
                </div>
              )}
              <Button variant="outline" asChild className="w-full">
                <Link to={`/exploracoes`}>Ver Exploração</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Photos Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Registo Fotográfico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoGalleryUpload
              bucket="exploration-photos"
              folder={`visitas/${id}`}
              existingPhotos={visita.fotos_urls || []}
              onPhotosChange={(urls) => updatePhotosMutation.mutate(urls)}
              maxPhotos={20}
              maxSizeMB={5}
            />
          </CardContent>
        </Card>

        {/* Control Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ações de Controlo</CardTitle>
            <Dialog open={isAddActionOpen} onOpenChange={setIsAddActionOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Ação de Controlo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Ação *</Label>
                    <Select
                      value={newAction.tipo}
                      onValueChange={(value) =>
                        setNewAction({ ...newAction, tipo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="correcao">Correção</SelectItem>
                        <SelectItem value="melhoria">Melhoria</SelectItem>
                        <SelectItem value="formacao">Formação</SelectItem>
                        <SelectItem value="documentacao">Documentação</SelectItem>
                        <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Textarea
                      id="descricao"
                      value={newAction.descricao}
                      onChange={(e) =>
                        setNewAction({ ...newAction, descricao: e.target.value })
                      }
                      placeholder="Descreva a ação a ser tomada..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prazo">Prazo</Label>
                      <Input
                        id="prazo"
                        type="date"
                        value={newAction.prazo}
                        onChange={(e) =>
                          setNewAction({ ...newAction, prazo: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="responsavel">Responsável</Label>
                      <Input
                        id="responsavel"
                        value={newAction.responsavel}
                        onChange={(e) =>
                          setNewAction({ ...newAction, responsavel: e.target.value })
                        }
                        placeholder="Nome do responsável"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddActionOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => addAcaoMutation.mutate()}
                      disabled={!newAction.tipo || !newAction.descricao || addAcaoMutation.isPending}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {acoes && acoes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Prazo</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acoes.map((acao) => (
                      <TableRow key={acao.id}>
                        <TableCell className="capitalize">{acao.tipo}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {acao.descricao}
                        </TableCell>
                        <TableCell>
                          {acao.prazo
                            ? format(new Date(acao.prazo), "dd/MM/yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>{acao.responsavel || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              acaoEstadoColors[acao.estado as ActionStatus]
                            }`}
                          >
                            {acaoEstadoLabels[acao.estado as ActionStatus]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={acao.estado}
                            onValueChange={(value: ActionStatus) =>
                              updateAcaoEstadoMutation.mutate({
                                acaoId: acao.id,
                                novoEstado: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendente">Pendente</SelectItem>
                              <SelectItem value="em_curso">Em Curso</SelectItem>
                              <SelectItem value="concluida">Concluída</SelectItem>
                              <SelectItem value="nao_cumprida">Não Cumprida</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma ação de controlo registada.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registar Observações</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="conformidade">Conformidade Geral</Label>
                <Select
                  value={editData.conformidade_geral}
                  onValueChange={(value) =>
                    setEditData({ ...editData, conformidade_geral: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conforme">Conforme</SelectItem>
                    <SelectItem value="parcialmente_conforme">Parcialmente Conforme</SelectItem>
                    <SelectItem value="nao_conforme">Não Conforme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea
                  id="obs"
                  value={editData.observacoes}
                  onChange={(e) =>
                    setEditData({ ...editData, observacoes: e.target.value })
                  }
                  placeholder="Registe as observações da visita..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => updateVisitaMutation.mutate()}
                  disabled={updateVisitaMutation.isPending}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default VisitaDetalhes;
