import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, Filter } from "lucide-react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Auditoria() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', page, tableFilter, actionFilter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (tableFilter !== 'all') {
        query = query.eq('table_name', tableFilter);
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    },
  });

  const filteredLogs = logs?.data?.filter((log) =>
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.record_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      INSERT: { variant: "default", label: "Criação" },
      UPDATE: { variant: "secondary", label: "Atualização" },
      DELETE: { variant: "destructive", label: "Eliminação" }
    };

    const config = variants[action] || { variant: "secondary", label: action };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auditoria</h1>
          <p className="text-muted-foreground mt-1">
            Histórico completo de alterações no sistema
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por utilizador, tabela ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Select value={tableFilter} onValueChange={setTableFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tabela" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as tabelas</SelectItem>
                    <SelectItem value="lotes">Lotes</SelectItem>
                    <SelectItem value="parcelas">Parcelas</SelectItem>
                    <SelectItem value="harvests">Colheitas</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as ações</SelectItem>
                    <SelectItem value="INSERT">Criação</SelectItem>
                    <SelectItem value="UPDATE">Atualização</SelectItem>
                    <SelectItem value="DELETE">Eliminação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>ID do Registo</TableHead>
                  <TableHead>Utilizador</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs && filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.timestamp).toLocaleString('pt-PT')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.table_name}</Badge>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.record_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.user_email || 'Sistema'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum registo de auditoria encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {logs && logs.count && logs.count > pageSize && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page + 1} de {Math.ceil(logs.count / pageSize)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * pageSize >= logs.count}
                >
                  Seguinte
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Alteração</DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tabela:</span> {selectedLog.table_name}
                  </div>
                  <div>
                    <span className="font-medium">Ação:</span> {selectedLog.action}
                  </div>
                  <div>
                    <span className="font-medium">Data/Hora:</span>{' '}
                    {new Date(selectedLog.timestamp).toLocaleString('pt-PT')}
                  </div>
                  <div>
                    <span className="font-medium">Utilizador:</span> {selectedLog.user_email}
                  </div>
                </div>

                {selectedLog.old_data && (
                  <div>
                    <h3 className="font-medium mb-2">Dados Antigos:</h3>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.old_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_data && (
                  <div>
                    <h3 className="font-medium mb-2">Dados Novos:</h3>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.new_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}