import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import DataTablePagination from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 15;

const Exploracoes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinciaFilter, setProvinciaFilter] = useState("all");
  const [page, setPage] = useState(0);

  const { data: exploracoes, isLoading } = useQuery({
    queryKey: ["exploracoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exploracoes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const provincias = useMemo(() => {
    if (!exploracoes) return [];
    return [...new Set(exploracoes.map((e) => e.provincia))].sort();
  }, [exploracoes]);

  const filtered = useMemo(() => {
    if (!exploracoes) return [];
    return exploracoes.filter((e) => {
      const matchSearch =
        e.designacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.municipio.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      const matchProvincia = provinciaFilter === "all" || e.provincia === provinciaFilter;
      return matchSearch && matchStatus && matchProvincia;
    });
  }, [exploracoes, searchTerm, statusFilter, provinciaFilter]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      validado: "bg-secondary",
      pendente: "bg-accent",
      indeferido: "bg-destructive",
    };
    return <Badge className={variants[status] || "bg-muted"}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Explorações Agrícolas</h1>
            <p className="text-muted-foreground">Gestão de explorações de café</p>
          </div>
          <Button onClick={() => navigate("/exploracoes/nova")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Exploração
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Minhas Explorações</CardTitle>
            <CardDescription>{filtered.length} explorações encontradas</CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por designação ou município..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos estados</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="validado">Validado</SelectItem>
                  <SelectItem value="indeferido">Indeferido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={provinciaFilter} onValueChange={(v) => { setProvinciaFilter(v); setPage(0); }}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Província" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas províncias</SelectItem>
                  {provincias.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-5 w-1/4 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-1/4 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-1/6 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-1/6 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {filtered.length === 0 && exploracoes && exploracoes.length > 0
                    ? "Nenhuma exploração corresponde aos filtros."
                    : "Ainda não tem explorações registadas."}
                </p>
                {exploracoes && exploracoes.length === 0 && (
                  <Button onClick={() => navigate("/exploracoes/nova")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registar Primeira Exploração
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Designação</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Área (ha)</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell className="font-medium">{exp.designacao}</TableCell>
                          <TableCell>{exp.municipio}, {exp.provincia}</TableCell>
                          <TableCell>{exp.area_ha}</TableCell>
                          <TableCell>{getStatusBadge(exp.status || "pendente")}</TableCell>
                          <TableCell>{new Date(exp.created_at).toLocaleDateString("pt-PT")}</TableCell>
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

export default Exploracoes;
