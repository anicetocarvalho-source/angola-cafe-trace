import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import DataTablePagination from "@/components/DataTablePagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, FileCheck, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const PAGE_SIZE = 15;

const Qualidade = () => {
  const [certificacoes, setCertificacoes] = useState<QualidadeCert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [page, setPage] = useState(0);

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

  const filtered = useMemo(() => {
    return certificacoes.filter((c) => {
      const matchSearch = (c.lotes?.referencia_lote || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = tipoFilter === "all" || c.tipo === tipoFilter;
      return matchSearch && matchTipo;
    });
  }, [certificacoes, searchTerm, tipoFilter]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Controlo de Qualidade</h1>
            <p className="text-muted-foreground text-sm">
              Análises laboratoriais e certificações
            </p>
          </div>
          <Button onClick={() => window.location.href = "/nova-analise"} className="w-full sm:w-auto">
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
            <CardDescription>{filtered.length} análises encontradas</CardDescription>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Pesquisar por lote..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }} className="pl-10" />
              </div>
              <Select value={tipoFilter} onValueChange={(v) => { setTipoFilter(v); setPage(0); }}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos tipos</SelectItem>
                  <SelectItem value="fisico">Físico</SelectItem>
                  <SelectItem value="sensorial">Sensorial</SelectItem>
                  <SelectItem value="quimico">Químico</SelectItem>
                  <SelectItem value="residuos">Resíduos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-5 w-1/4 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-1/4 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-1/6 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Ainda não há análises de qualidade registadas
                </p>
              </div>
            ) : (
              <>
              <div className="rounded-md border overflow-x-auto">
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
                    {paginated.map((cert) => (
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
              <DataTablePagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
              </>
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
