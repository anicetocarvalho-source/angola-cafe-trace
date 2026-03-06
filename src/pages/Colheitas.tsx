import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import DataTablePagination from "@/components/DataTablePagination";

const PAGE_SIZE = 15;

export default function Colheitas() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  const { data: harvests, isLoading } = useQuery({
    queryKey: ['harvests', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('harvests')
        .select(`
          *,
          parcela:parcelas(
            codigo_parcela,
            exploracao:exploracoes(designacao)
          )
        `)
        .order('harvest_date', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredHarvests = useMemo(() => {
    return harvests?.filter((harvest) =>
      harvest.parcela?.codigo_parcela.toLowerCase().includes(searchTerm.toLowerCase()) ||
      harvest.parcela?.exploracao?.designacao.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [harvests, searchTerm]);

  const paginated = filteredHarvests.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      planned: { variant: "secondary", label: "Planeada" },
      in_progress: { variant: "default", label: "Em Curso" },
      completed: { variant: "default", label: "Concluída" },
      cancelled: { variant: "destructive", label: "Cancelada" }
    };

    const config = variants[status] || variants.planned;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestão de Colheitas</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Planeamento e registo de colheitas
            </p>
          </div>
          <Button onClick={() => navigate('/colheitas/nova')} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Colheita
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por parcela ou exploração..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setStatusFilter('all'); setPage(0); }}
                >
                  Todas
                </Button>
                <Button
                  variant={statusFilter === 'planned' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setStatusFilter('planned'); setPage(0); }}
                >
                  Planeadas
                </Button>
                <Button
                  variant={statusFilter === 'in_progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setStatusFilter('in_progress'); setPage(0); }}
                >
                  Em Curso
                </Button>
                <Button
                  variant={statusFilter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setStatusFilter('completed'); setPage(0); }}
                >
                  Concluídas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Exploração</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Qualidade</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length > 0 ? (
                  paginated.map((harvest) => (
                    <TableRow key={harvest.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(harvest.harvest_date).toLocaleDateString('pt-PT')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {harvest.parcela?.codigo_parcela}
                      </TableCell>
                      <TableCell>
                        {harvest.parcela?.exploracao?.designacao}
                      </TableCell>
                      <TableCell>
                        {harvest.quantity} {harvest.unit}
                      </TableCell>
                      <TableCell>
                        {harvest.quality_score ? (
                          <Badge variant="outline">
                            {harvest.quality_score}/100
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(harvest.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        -
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/colheitas/${harvest.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhuma colheita encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
            <DataTablePagination currentPage={page} totalItems={filteredHarvests.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}