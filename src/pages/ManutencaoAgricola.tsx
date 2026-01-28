import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Leaf, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Manutencao {
  id: string;
  parcela_id: string;
  data_execucao: string;
  tipo: string;
  descricao: string | null;
  produtos_utilizados: string[] | null;
  quantidade_produto: number | null;
  unidade_produto: string | null;
  area_aplicada_ha: number | null;
  responsavel: string | null;
  custo_estimado: number | null;
  observacoes: string | null;
  parcelas: {
    codigo_parcela: string;
    exploracoes: {
      designacao: string;
    };
  };
}

const tipoLabels: Record<string, string> = {
  tratamento: "Tratamento Fitossanitário",
  fertilizacao: "Fertilização",
  poda: "Poda",
  capina: "Capina/Monda",
  irrigacao: "Irrigação",
  outro: "Outro",
};

const tipoBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  tratamento: "destructive",
  fertilizacao: "default",
  poda: "secondary",
  capina: "outline",
  irrigacao: "default",
  outro: "outline",
};

const ManutencaoAgricola = () => {
  const navigate = useNavigate();
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManutencoes();
  }, []);

  const fetchManutencoes = async () => {
    try {
      const { data, error } = await supabase
        .from("manutencao_agricola")
        .select(`
          *,
          parcelas (
            codigo_parcela,
            exploracoes (
              designacao
            )
          )
        `)
        .order("data_execucao", { ascending: false });

      if (error) throw error;
      setManutencoes((data as unknown as Manutencao[]) || []);
    } catch (error) {
      console.error("Error fetching manutencoes:", error);
      toast.error("Erro ao carregar registos de manutenção");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("manutencao_agricola")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Registo eliminado com sucesso");
      fetchManutencoes();
    } catch (error) {
      console.error("Error deleting manutencao:", error);
      toast.error("Erro ao eliminar registo");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manutenção Agrícola</h1>
            <p className="text-muted-foreground">
              Gestão de tratamentos, fertilizações e práticas culturais
            </p>
          </div>
          <Button onClick={() => navigate("/manutencao/nova")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Manutenção
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Registos</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{manutencoes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {manutencoes.filter(m => {
                  const date = new Date(m.data_execucao);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total Estimado</CardTitle>
              <span className="text-muted-foreground text-xs">AOA</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {manutencoes.reduce((acc, m) => acc + (m.custo_estimado || 0), 0).toLocaleString("pt-AO")}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registos de Manutenção</CardTitle>
            <CardDescription>
              {manutencoes.length} registos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar...</p>
            ) : manutencoes.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Ainda não existem registos de manutenção agrícola.
                </p>
                <Button onClick={() => navigate("/manutencao/nova")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registar Primeira Manutenção
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Exploração</TableHead>
                      <TableHead>Produtos</TableHead>
                      <TableHead>Custo (AOA)</TableHead>
                      <TableHead className="text-right">Acções</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manutencoes.map((manutencao) => (
                      <TableRow key={manutencao.id}>
                        <TableCell>
                          {format(new Date(manutencao.data_execucao), "dd/MM/yyyy", { locale: pt })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tipoBadgeVariant[manutencao.tipo] || "outline"}>
                            {tipoLabels[manutencao.tipo] || manutencao.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {manutencao.parcelas?.codigo_parcela}
                        </TableCell>
                        <TableCell>
                          {manutencao.parcelas?.exploracoes?.designacao}
                        </TableCell>
                        <TableCell>
                          {manutencao.produtos_utilizados?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {manutencao.produtos_utilizados.slice(0, 2).map((p, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {p}
                                </Badge>
                              ))}
                              {manutencao.produtos_utilizados.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{manutencao.produtos_utilizados.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {manutencao.custo_estimado?.toLocaleString("pt-AO") || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminar Registo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem a certeza que deseja eliminar este registo de manutenção?
                                  Esta acção não pode ser revertida.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(manutencao.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManutencaoAgricola;
