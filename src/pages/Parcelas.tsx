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
import { Plus, MapPin, Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Parcela {
  id: string;
  codigo_parcela: string;
  area_ha: number;
  ano_plantio: number | null;
  irrigacao: boolean;
  sombra_percent: number | null;
  varietais: string[];
  exploracoes: {
    designacao: string;
    provincia: string;
  };
}

const PAGE_SIZE = 15;

const Parcelas = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  const { data: parcelas, isLoading } = useQuery({
    queryKey: ["parcelas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcelas")
        .select(`*, exploracoes (designacao, provincia)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Parcela[]) || [];
    },
  });

  const filtered = useMemo(() => {
    if (!parcelas) return [];
    return parcelas.filter((p) =>
      p.codigo_parcela.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.exploracoes?.designacao?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [parcelas, searchTerm]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Parcelas</h1>
            <p className="text-muted-foreground">Parcelas agrícolas dentro das explorações</p>
          </div>
          <Button onClick={() => navigate("/parcelas/nova")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Parcela
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Parcelas Registadas</CardTitle>
            <CardDescription>{filtered.length} parcelas encontradas</CardDescription>
            <div className="pt-2">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por código ou exploração..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                  className="pl-10"
                />
              </div>
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
                  {filtered.length === 0 && parcelas && parcelas.length > 0
                    ? "Nenhuma parcela corresponde à pesquisa."
                    : "Ainda não existem parcelas registadas no sistema."}
                </p>
                {parcelas && parcelas.length === 0 && (
                  <Button onClick={() => navigate("/parcelas/nova")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Registar Primeira Parcela
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Exploração</TableHead>
                        <TableHead>Área (ha)</TableHead>
                        <TableHead>Ano Plantio</TableHead>
                        <TableHead>Irrigação</TableHead>
                        <TableHead>Varietais</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((parcela) => (
                        <TableRow key={parcela.id}>
                          <TableCell className="font-medium">{parcela.codigo_parcela}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{parcela.exploracoes?.designacao}</p>
                              <p className="text-xs text-muted-foreground">{parcela.exploracoes?.provincia}</p>
                            </div>
                          </TableCell>
                          <TableCell>{parcela.area_ha}</TableCell>
                          <TableCell>{parcela.ano_plantio || "-"}</TableCell>
                          <TableCell>
                            {parcela.irrigacao ? (
                              <Badge className="bg-secondary">Sim</Badge>
                            ) : (
                              <Badge variant="outline">Não</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {parcela.varietais?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {parcela.varietais.slice(0, 2).map((v, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
                                ))}
                                {parcela.varietais.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{parcela.varietais.length - 2}</Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
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

export default Parcelas;
