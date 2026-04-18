import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, Database, RefreshCw, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

interface IntegrityReport {
  counts: Record<string, number>;
  orphans: Record<string, number>;
  generated_at: string;
}

interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  user_email: string | null;
  timestamp: string;
}

const orphanLabels: Record<string, string> = {
  parcelas_sem_exploracao: "Parcelas sem exploração",
  colheitas_sem_parcela: "Colheitas sem parcela",
  lotes_sem_colheita: "Lotes com colheita inválida",
  exploracoes_sem_produtor: "Explorações sem produtor",
  visitas_sem_exploracao: "Visitas sem exploração",
  acoes_sem_visita: "Acções sem visita",
  secagens_sem_lote: "Secagens sem lote",
  torras_sem_lote: "Torras sem lote",
  embalagens_sem_lote: "Embalagens sem lote",
  armazenamento_sem_lote: "Armazenamento sem lote",
  logistica_sem_lote: "Logística sem lote",
  comercializacao_sem_lote: "Comercialização sem lote",
  transformacoes_sem_lote: "Transformações sem lote",
  manutencao_sem_parcela: "Manutenção sem parcela",
  checklists_sem_lote: "Checklists sem lote",
  qualidade_sem_lote: "Qualidade sem lote",
  profiles_sem_entidade: "Perfis com entidade inválida",
};

const actionVariant = (action: string): "default" | "secondary" | "destructive" | "outline" => {
  if (action === "INSERT") return "default";
  if (action === "UPDATE") return "secondary";
  if (action === "DELETE") return "destructive";
  return "outline";
};

export const DataIntegrity = () => {
  const integrityQuery = useQuery({
    queryKey: ["data-integrity"],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)("get_data_integrity_report");
      if (error) throw error;
      return data as IntegrityReport;
    },
    refetchInterval: 30_000,
  });

  const auditQuery = useQuery({
    queryKey: ["recent-audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, table_name, record_id, action, user_email, timestamp")
        .order("timestamp", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as AuditLog[];
    },
    refetchInterval: 30_000,
  });

  const report = integrityQuery.data;
  const totalOrphans = report ? Object.values(report.orphans).reduce((a, b) => a + b, 0) : 0;
  const totalRecords = report ? Object.values(report.counts).reduce((a, b) => a + b, 0) : 0;

  const handleRefresh = () => {
    integrityQuery.refetch();
    auditQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Integridade de Dados</h2>
          <p className="text-sm text-muted-foreground">Actualizado automaticamente a cada 30 segundos</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={integrityQuery.isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${integrityQuery.isFetching ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registos</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {integrityQuery.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totalRecords.toLocaleString("pt-PT")}</div>
            )}
            <p className="text-xs text-muted-foreground">Em {report ? Object.keys(report.counts).length : 0} tabelas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registos Órfãos</CardTitle>
            {totalOrphans === 0 ? (
              <CheckCircle2 className="h-4 w-4 text-secondary" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            {integrityQuery.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className={`text-2xl font-bold ${totalOrphans > 0 ? "text-destructive" : "text-secondary"}`}>
                {totalOrphans}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {totalOrphans === 0 ? "Integridade OK" : "Requer atenção"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auditoria</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {integrityQuery.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{report?.counts.audit_logs ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Entradas totais registadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contagens por Tabela</CardTitle>
            <CardDescription>Total de registos em cada tabela principal</CardDescription>
          </CardHeader>
          <CardContent>
            {integrityQuery.isLoading ? (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : (
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Tabela</TableHead>
                      <TableHead className="text-right">Registos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report &&
                      Object.entries(report.counts)
                        .sort(([, a], [, b]) => b - a)
                        .map(([table, count]) => (
                          <TableRow key={table}>
                            <TableCell className="font-mono text-xs">{table}</TableCell>
                            <TableCell className="text-right font-medium">
                              {count.toLocaleString("pt-PT")}
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registos Órfãos</CardTitle>
            <CardDescription>Registos sem relação válida com pais</CardDescription>
          </CardHeader>
          <CardContent>
            {integrityQuery.isLoading ? (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
              </div>
            ) : (
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Verificação</TableHead>
                      <TableHead className="text-right">Órfãos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report &&
                      Object.entries(report.orphans)
                        .sort(([, a], [, b]) => b - a)
                        .map(([key, count]) => (
                          <TableRow key={key}>
                            <TableCell className="text-sm">{orphanLabels[key] || key}</TableCell>
                            <TableCell className="text-right">
                              {count === 0 ? (
                                <Badge variant="outline" className="text-secondary border-secondary">OK</Badge>
                              ) : (
                                <Badge variant="destructive">{count}</Badge>
                              )}
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

      <Card>
        <CardHeader>
          <CardTitle>Últimas 50 Entradas de Auditoria</CardTitle>
          <CardDescription>Histórico recente de alterações ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {auditQuery.isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : auditQuery.data && auditQuery.data.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quando</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>Acção</TableHead>
                    <TableHead>Utilizador</TableHead>
                    <TableHead className="hidden md:table-cell">Registo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditQuery.data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: pt })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                      <TableCell>
                        <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{log.user_email || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                        {log.record_id.slice(0, 8)}…
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              Sem entradas de auditoria registadas.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
