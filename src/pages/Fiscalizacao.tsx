import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Eye, ClipboardList, Calendar, CheckCircle, AlertTriangle, Bell, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";

type VisitType = "rotina" | "fiscalizacao" | "acompanhamento" | "emergencia";
type VisitStatus = "agendada" | "em_curso" | "realizada" | "cancelada";

interface VisitaTecnica {
  id: string;
  exploracao_id: string;
  tecnico_id: string;
  data_visita: string;
  tipo: VisitType;
  objetivo: string | null;
  observacoes: string | null;
  estado: VisitStatus;
  conformidade_geral: string | null;
  created_at: string;
  exploracoes?: {
    designacao: string;
    provincia: string;
    municipio: string;
  };
}

const tipoLabels: Record<VisitType, string> = {
  rotina: "Rotina",
  fiscalizacao: "Fiscalização",
  acompanhamento: "Acompanhamento",
  emergencia: "Emergência",
};

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

const Fiscalizacao = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const queryClient = useQueryClient();

  const checkDeadlinesMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("check-action-deadlines");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["acoes-stats"] });
      toast.success(`Verificação concluída: ${data.notificationsCreated} notificações criadas`);
    },
    onError: (error) => {
      toast.error("Erro ao verificar prazos");
      console.error(error);
    },
  });

  const { data: visitas, isLoading } = useQuery({
    queryKey: ["visitas-tecnicas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitas_tecnicas")
        .select(`
          *,
          exploracoes (
            designacao,
            provincia,
            municipio
          )
        `)
        .order("data_visita", { ascending: false });

      if (error) throw error;
      return data as VisitaTecnica[];
    },
  });

  const { data: acoesStats } = useQuery({
    queryKey: ["acoes-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acoes_controlo")
        .select("estado");

      if (error) throw error;

      const stats = {
        pendentes: data.filter((a) => a.estado === "pendente").length,
        emCurso: data.filter((a) => a.estado === "em_curso").length,
        concluidas: data.filter((a) => a.estado === "concluida").length,
        naoCumpridas: data.filter((a) => a.estado === "nao_cumprida").length,
      };

      return stats;
    },
  });

  const filteredVisitas = visitas?.filter((visita) => {
    const matchesSearch =
      visita.exploracoes?.designacao
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      visita.objetivo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = filterTipo === "all" || visita.tipo === filterTipo;
    const matchesEstado = filterEstado === "all" || visita.estado === filterEstado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  const visitasAgendadas = visitas?.filter((v) => v.estado === "agendada").length || 0;
  const visitasRealizadas = visitas?.filter((v) => v.estado === "realizada").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fiscalização INCA</h1>
            <p className="text-muted-foreground">
              Gestão de visitas técnicas e ações de controlo
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => checkDeadlinesMutation.mutate()}
              disabled={checkDeadlinesMutation.isPending}
            >
              {checkDeadlinesMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              Verificar Prazos
            </Button>
            <Button asChild>
              <Link to="/fiscalizacao/nova">
                <Plus className="h-4 w-4 mr-2" />
                Nova Visita
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas Agendadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitasAgendadas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas Realizadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitasRealizadas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações Pendentes</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {acoesStats?.pendentes || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Não Cumpridas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {acoesStats?.naoCumpridas || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por exploração ou objetivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="rotina">Rotina</SelectItem>
                  <SelectItem value="fiscalizacao">Fiscalização</SelectItem>
                  <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em_curso">Em Curso</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Visits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Visitas Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                A carregar...
              </div>
            ) : filteredVisitas && filteredVisitas.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Exploração</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Objetivo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitas.map((visita) => (
                      <TableRow key={visita.id}>
                        <TableCell className="font-medium">
                          {format(new Date(visita.data_visita), "dd/MM/yyyy", {
                            locale: pt,
                          })}
                        </TableCell>
                        <TableCell>
                          {visita.exploracoes?.designacao || "-"}
                        </TableCell>
                        <TableCell>
                          {visita.exploracoes?.municipio},{" "}
                          {visita.exploracoes?.provincia}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tipoLabels[visita.tipo]}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {visita.objetivo || "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              estadoColors[visita.estado]
                            }`}
                          >
                            {estadoLabels[visita.estado]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/fiscalizacao/${visita.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma visita técnica encontrada.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Fiscalizacao;
