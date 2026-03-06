import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Lote {
  id: string;
  referencia_lote: string;
  tipo: string;
  volume_kg: number;
  estado: string;
  classificacao_sensorial: number | null;
  created_at: string;
}

const Lotes = () => {
  const navigate = useNavigate();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLotes();
  }, []);

  const fetchLotes = async () => {
    try {
      const { data, error } = await supabase
        .from("lotes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setLotes(data || []);
    } catch (error) {
      console.error("Error fetching lotes:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <CardDescription>
              {lotes.length} lotes no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
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
            ) : lotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Ainda não existem lotes registados no sistema.
                </p>
                <Button onClick={() => navigate("/lotes/novo")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registar Primeiro Lote
                </Button>
              </div>
            ) : (
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
                    {lotes.map((lote) => (
                      <TableRow key={lote.id}>
                        <TableCell className="font-medium">
                          {lote.referencia_lote}
                        </TableCell>
                        <TableCell>{getTipoLabel(lote.tipo)}</TableCell>
                        <TableCell>{lote.volume_kg}</TableCell>
                        <TableCell>
                          {lote.classificacao_sensorial ? (
                            <span
                              className={
                                lote.classificacao_sensorial >= 85
                                  ? "text-secondary font-semibold"
                                  : lote.classificacao_sensorial >= 80
                                  ? "text-accent"
                                  : ""
                              }
                            >
                              {lote.classificacao_sensorial}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getEstadoBadge(lote.estado)}</TableCell>
                        <TableCell>
                          {new Date(lote.created_at).toLocaleDateString("pt-PT")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/lotes/${lote.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

export default Lotes;
