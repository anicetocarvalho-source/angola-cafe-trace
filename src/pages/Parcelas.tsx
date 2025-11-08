import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

const Parcelas = () => {
  const navigate = useNavigate();
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParcelas();
  }, []);

  const fetchParcelas = async () => {
    try {
      const { data, error } = await supabase
        .from("parcelas")
        .select(`
          *,
          exploracoes (
            designacao,
            provincia
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParcelas(data as Parcela[] || []);
    } catch (error) {
      console.error("Error fetching parcelas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
            <CardDescription>
              {parcelas.length} parcelas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar...</p>
            ) : parcelas.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Ainda não existem parcelas registadas no sistema.
                </p>
                <Button onClick={() => navigate("/parcelas/nova")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registar Primeira Parcela
                </Button>
              </div>
            ) : (
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
                    {parcelas.map((parcela) => (
                      <TableRow key={parcela.id}>
                        <TableCell className="font-medium">
                          {parcela.codigo_parcela}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{parcela.exploracoes?.designacao}</p>
                            <p className="text-xs text-muted-foreground">
                              {parcela.exploracoes?.provincia}
                            </p>
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
                                <Badge key={i} variant="outline" className="text-xs">
                                  {v}
                                </Badge>
                              ))}
                              {parcela.varietais.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{parcela.varietais.length - 2}
                                </Badge>
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Parcelas;
