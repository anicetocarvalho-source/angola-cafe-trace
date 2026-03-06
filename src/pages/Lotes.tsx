import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import DataTablePagination from "@/components/DataTablePagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Eye, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 15;

const Lotes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [page, setPage] = useState(0);

  const { data: lotes, isLoading } = useQuery({
    queryKey: ["lotes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = useMemo(() => {
    if (!lotes) return [];
    return lotes.filter((l) => {
      const matchSearch = l.referencia_lote.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado = estadoFilter === "all" || l.estado === estadoFilter;
      const matchTipo = tipoFilter === "all" || l.tipo === tipoFilter;
      return matchSearch && matchEstado && matchTipo;
    });
  }, [lotes, searchTerm, estadoFilter, tipoFilter]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      pendente: "bg-accent",
      em_processo: "bg-muted",
      aprovado: "bg-secondary",
      reprovado: "bg-destructive",
      exportado: "bg-primary",
      consumido: "bg-muted",
    };
    return <Badge className={variants[estado] || "bg-muted"}>{estado}</Badge>;
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Lotes</h1>
            <p className="text-muted-foreground">Registo e acompanhamento de lotes de café</p>
          </div>
          <Button onClick={() => navigate("/lotes/novo")}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lote
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lotes Registados</CardTitle>
            <CardDescription>{filtered.length} lotes encontrados</CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por referência..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                  className="pl-10"
                />
              </div>
              <Select value={estadoFilter} onValueChange={(v) => { setEstadoFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos estados</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_processo">Em Processo</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="reprovado">Reprovado</SelectItem>
                  <SelectItem value="exportado">Exportado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={(v) => { setTipoFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos tipos</SelectItem>
                  <SelectItem value="cereja">Cereja</SelectItem>
                  <SelectItem value="cafe_verde">Café Verde</SelectItem>
                  <SelectItem value="parchment">Pergaminho</SelectItem>
                  <SelectItem value="torrado">Torrado</SelectItem>
                  <SelectItem value="moido">Moído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-5 w-1/5 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-1/6 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-1/6 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-1/6 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-1/6 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {filtered.length === 0 && lotes && lotes.length > 0
                    ? "Nenhum lote corresponde aos filtros aplicados."
                    : "Ainda não existem lotes registados no sistema."}
                </p>
                {lotes && lotes.length === 0 && (
                  <Button onClick={() => navigate("/lotes/novo")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registar Primeiro Lote
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referência</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Volume (kg)</TableHead>
                        <TableHead>SCA Score</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Acções</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((lote) => (
                        <TableRow key={lote.id}>
                          <TableCell className="font-medium">{lote.referencia_lote}</TableCell>
                          <TableCell>{getTipoLabel(lote.tipo)}</TableCell>
                          <TableCell>{lote.volume_kg}</TableCell>
                          <TableCell>
                            {lote.classificacao_sensorial ? (
                              <span className={lote.classificacao_sensorial >= 85 ? "text-secondary font-semibold" : lote.classificacao_sensorial >= 80 ? "text-accent" : ""}>
                                {lote.classificacao_sensorial}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getEstadoBadge(lote.estado || "pendente")}</TableCell>
                          <TableCell>{new Date(lote.created_at).toLocaleDateString("pt-PT")}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/lotes/${lote.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <DataTablePagination
                  currentPage={page}
                  totalItems={filtered.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Lotes;
