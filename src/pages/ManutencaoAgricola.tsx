import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Leaf, Calendar, Trash2, Filter, X, CalendarIcon, Pencil, Download, FileSpreadsheet } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

interface Parcela {
  id: string;
  codigo_parcela: string;
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

const tiposManutencao = [
  { value: "tratamento", label: "Tratamento Fitossanitário" },
  { value: "fertilizacao", label: "Fertilização" },
  { value: "poda", label: "Poda" },
  { value: "capina", label: "Capina/Monda" },
  { value: "irrigacao", label: "Irrigação" },
  { value: "outro", label: "Outro" },
];

const ManutencaoAgricola = () => {
  const navigate = useNavigate();
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedParcela, setSelectedParcela] = useState<string>("all");
  const [selectedTipo, setSelectedTipo] = useState<string>("all");
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();

  useEffect(() => {
    fetchManutencoes();
    fetchParcelas();
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

  const fetchParcelas = async () => {
    try {
      const { data, error } = await supabase
        .from("parcelas")
        .select("id, codigo_parcela")
        .order("codigo_parcela");

      if (error) throw error;
      setParcelas(data || []);
    } catch (error) {
      console.error("Error fetching parcelas:", error);
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

  const clearFilters = () => {
    setSelectedParcela("all");
    setSelectedTipo("all");
    setDataInicio(undefined);
    setDataFim(undefined);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Manutencao Agricola - INCA Coffee Trace", 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Data: ${format(new Date(), "dd/MM/yyyy", { locale: pt })}`, 14, 30);
    doc.text(`Total de registos: ${filteredManutencoes.length}`, 14, 36);
    
    if (hasActiveFilters) {
      doc.setFontSize(9);
      const filterTexts: string[] = [];
      if (selectedParcela !== "all") {
        const parcela = parcelas.find(p => p.id === selectedParcela);
        filterTexts.push(`Parcela: ${parcela?.codigo_parcela || selectedParcela}`);
      }
      if (selectedTipo !== "all") {
        filterTexts.push(`Tipo: ${tipoLabels[selectedTipo] || selectedTipo}`);
      }
      if (dataInicio) {
        filterTexts.push(`Desde: ${format(dataInicio, "dd/MM/yyyy")}`);
      }
      if (dataFim) {
        filterTexts.push(`Ate: ${format(dataFim, "dd/MM/yyyy")}`);
      }
      doc.text(`Filtros: ${filterTexts.join(" | ")}`, 14, 42);
    }

    const tableData = filteredManutencoes.map((m) => [
      format(new Date(m.data_execucao), "dd/MM/yyyy"),
      tipoLabels[m.tipo] || m.tipo,
      m.parcelas?.codigo_parcela || "-",
      m.parcelas?.exploracoes?.designacao || "-",
      m.produtos_utilizados?.join(", ") || "-",
      m.custo_estimado?.toLocaleString("pt-AO") || "-",
    ]);

    autoTable(doc, {
      startY: hasActiveFilters ? 48 : 42,
      head: [["Data", "Tipo", "Parcela", "Exploracao", "Produtos", "Custo (AOA)"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
    });

    doc.save(`manutencao-agricola-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("PDF exportado com sucesso!");
  };

  const exportToExcel = () => {
    const data = filteredManutencoes.map((m) => ({
      Data: format(new Date(m.data_execucao), "dd/MM/yyyy"),
      Tipo: tipoLabels[m.tipo] || m.tipo,
      Parcela: m.parcelas?.codigo_parcela || "-",
      Exploracao: m.parcelas?.exploracoes?.designacao || "-",
      Descricao: m.descricao || "-",
      Produtos: m.produtos_utilizados?.join(", ") || "-",
      Quantidade: m.quantidade_produto || "-",
      Unidade: m.unidade_produto || "-",
      "Area (ha)": m.area_aplicada_ha || "-",
      Responsavel: m.responsavel || "-",
      "Custo (AOA)": m.custo_estimado || "-",
      Observacoes: m.observacoes || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Manutencao Agricola");
    
    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `manutencao-agricola-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast.success("Excel exportado com sucesso!");
  };

  const hasActiveFilters = selectedParcela !== "all" || selectedTipo !== "all" || dataInicio || dataFim;

  const filteredManutencoes = useMemo(() => {
    return manutencoes.filter((m) => {
      // Filter by parcela
      if (selectedParcela !== "all" && m.parcela_id !== selectedParcela) {
        return false;
      }
      
      // Filter by tipo
      if (selectedTipo !== "all" && m.tipo !== selectedTipo) {
        return false;
      }
      
      // Filter by date range
      const dataExecucao = new Date(m.data_execucao);
      if (dataInicio && dataExecucao < dataInicio) {
        return false;
      }
      if (dataFim) {
        const endOfDay = new Date(dataFim);
        endOfDay.setHours(23, 59, 59, 999);
        if (dataExecucao > endOfDay) {
          return false;
        }
      }
      
      return true;
    });
  }, [manutencoes, selectedParcela, selectedTipo, dataInicio, dataFim]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manutenção Agrícola</h1>
            <p className="text-muted-foreground">
              Gestão de tratamentos, fertilizações e práticas culturais
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToPDF} disabled={filteredManutencoes.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={exportToExcel} disabled={filteredManutencoes.length === 0}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button onClick={() => navigate("/manutencao/nova")}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Manutenção
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Registos</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredManutencoes.length}</div>
              {hasActiveFilters && (
                <p className="text-xs text-muted-foreground">de {manutencoes.length} total</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredManutencoes.filter(m => {
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
                {filteredManutencoes.reduce((acc, m) => acc + (m.custo_estimado || 0), 0).toLocaleString("pt-AO")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Filtros</CardTitle>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Parcela</label>
                <Select value={selectedParcela} onValueChange={setSelectedParcela}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as parcelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as parcelas</SelectItem>
                    {parcelas.map((parcela) => (
                      <SelectItem key={parcela.id} value={parcela.id}>
                        {parcela.codigo_parcela}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Manutenção</label>
                <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {tiposManutencao.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, "dd/MM/yyyy", { locale: pt }) : "Seleccione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: pt }) : "Seleccione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dataFim}
                      onSelect={setDataFim}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registos de Manutenção</CardTitle>
            <CardDescription>
              {filteredManutencoes.length} registos {hasActiveFilters ? "filtrados" : "no sistema"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar...</p>
            ) : filteredManutencoes.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? "Nenhum registo encontrado com os filtros seleccionados."
                    : "Ainda não existem registos de manutenção agrícola."
                  }
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/manutencao/nova")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registar Primeira Manutenção
                  </Button>
                )}
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
                    {filteredManutencoes.map((manutencao) => (
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
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => navigate(`/manutencao/${manutencao.id}/editar`)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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
                          </div>
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
