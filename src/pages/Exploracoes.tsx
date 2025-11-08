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

interface Exploracao {
  id: string;
  designacao: string;
  provincia: string;
  municipio: string;
  area_ha: number;
  status: string;
  created_at: string;
}

const Exploracoes = () => {
  const navigate = useNavigate();
  const [exploracoes, setExploracoes] = useState<Exploracao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExploracoes();
  }, []);

  const fetchExploracoes = async () => {
    try {
      const { data, error } = await supabase
        .from("exploracoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExploracoes(data || []);
    } catch (error) {
      console.error("Error fetching exploracoes:", error);
    } finally {
      setLoading(false);
    }
  };

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
            <CardDescription>{exploracoes.length} explorações registadas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar...</p>
            ) : exploracoes.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Ainda não tem explorações registadas.
                </p>
                <Button onClick={() => navigate("/exploracoes/nova")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registar Primeira Exploração
                </Button>
              </div>
            ) : (
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
                    {exploracoes.map((exp) => (
                      <TableRow key={exp.id}>
                        <TableCell className="font-medium">{exp.designacao}</TableCell>
                        <TableCell>
                          {exp.municipio}, {exp.provincia}
                        </TableCell>
                        <TableCell>{exp.area_ha}</TableCell>
                        <TableCell>{getStatusBadge(exp.status)}</TableCell>
                        <TableCell>
                          {new Date(exp.created_at).toLocaleDateString("pt-PT")}
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

export default Exploracoes;
