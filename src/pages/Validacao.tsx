import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PendingItem {
  id: string;
  type: "exploracao" | "lote";
  title: string;
  subtitle: string;
  created_at: string;
}

const Validacao = () => {
  const { user, hasRole } = useAuth();
  const [pendingExploracoes, setPendingExploracoes] = useState<any[]>([]);
  const [pendingLotes, setPendingLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [scaScore, setScaScore] = useState("");
  const [humidity, setHumidity] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (hasRole("tecnico_inca") || hasRole("admin_inca")) {
      fetchPendingItems();
    }
  }, [hasRole]);

  const fetchPendingItems = async () => {
    try {
      // Fetch pending exploracoes
      const { data: exploracoes } = await supabase
        .from("exploracoes")
        .select("*")
        .eq("status", "pendente")
        .order("created_at", { ascending: false });

      // Fetch pending lotes
      const { data: lotes } = await supabase
        .from("lotes")
        .select("*")
        .eq("estado", "pendente")
        .order("created_at", { ascending: false });

      setPendingExploracoes(exploracoes || []);
      setPendingLotes(lotes || []);
    } catch (error) {
      console.error("Error fetching pending items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateExploracao = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from("exploracoes")
        .update({
          status: approved ? "validado" : "indeferido",
          validado_por: user?.id,
          validado_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast.success(
        approved ? "Exploração validada com sucesso" : "Exploração indeferida"
      );
      fetchPendingItems();
    } catch (error: any) {
      console.error("Error validating exploracao:", error);
      toast.error(error.message || "Erro ao validar exploração");
    }
  };

  const handleValidateLote = async (id: string, approved: boolean) => {
    try {
      const updates: any = {
        estado: approved ? "aprovado" : "reprovado",
      };

      if (approved && scaScore) {
        updates.classificacao_sensorial = parseFloat(scaScore);
      }
      if (humidity) {
        updates.humidade_percent = parseFloat(humidity);
      }

      const { error } = await supabase
        .from("lotes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast.success(
        approved ? "Lote aprovado com sucesso" : "Lote reprovado"
      );
      setSelectedItem(null);
      setScaScore("");
      setHumidity("");
      setNotes("");
      fetchPendingItems();
    } catch (error: any) {
      console.error("Error validating lote:", error);
      toast.error(error.message || "Erro ao validar lote");
    }
  };

  if (!hasRole("tecnico_inca") && !hasRole("admin_inca")) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Esta área é restrita a técnicos INCA.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Validação & Qualidade</h1>
          <p className="text-muted-foreground">
            Aprovar explorações e certificar lotes de café
          </p>
        </div>

        <Tabs defaultValue="exploracoes">
          <TabsList>
            <TabsTrigger value="exploracoes">
              Explorações Pendentes ({pendingExploracoes.length})
            </TabsTrigger>
            <TabsTrigger value="lotes">
              Lotes Pendentes ({pendingLotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exploracoes" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  A carregar...
                </CardContent>
              </Card>
            ) : pendingExploracoes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Não há explorações pendentes de validação
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingExploracoes.map((exp) => (
                <Card key={exp.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{exp.designacao}</CardTitle>
                        <CardDescription>
                          {exp.municipio}, {exp.provincia} • {exp.area_ha} ha
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Pendente</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleValidateExploracao(exp.id, true)}
                        variant="default"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Validar
                      </Button>
                      <Button
                        onClick={() => handleValidateExploracao(exp.id, false)}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Indeferir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="lotes" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  A carregar...
                </CardContent>
              </Card>
            ) : pendingLotes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Não há lotes pendentes de validação
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingLotes.map((lote) => (
                <Card key={lote.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{lote.referencia_lote}</CardTitle>
                        <CardDescription>
                          {lote.tipo} • {lote.volume_kg} kg
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Pendente</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedItem(lote)}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Avaliar Qualidade
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Avaliação de Qualidade</DialogTitle>
                          <DialogDescription>
                            {lote.referencia_lote}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>SCA Score (0-100)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={scaScore}
                              onChange={(e) => setScaScore(e.target.value)}
                              placeholder="Ex: 85.5"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Humidade (%)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={humidity}
                              onChange={(e) => setHumidity(e.target.value)}
                              placeholder="Ex: 12.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Notas</Label>
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Observações sobre a qualidade..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleValidateLote(lote.id, true)}
                              className="flex-1"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button
                              onClick={() => handleValidateLote(lote.id, false)}
                              variant="destructive"
                              className="flex-1"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reprovar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Validacao;
