import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";

type VisitType = "rotina" | "fiscalizacao" | "acompanhamento" | "emergencia";

const NovaVisita = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    exploracao_id: "",
    data_visita: "",
    tipo: "rotina" as VisitType,
    objetivo: "",
    observacoes: "",
  });

  const { data: exploracoes } = useQuery({
    queryKey: ["exploracoes-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exploracoes")
        .select("id, designacao, provincia, municipio")
        .order("designacao");

      if (error) throw error;
      return data;
    },
  });

  const createVisitaMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("visitas_tecnicas")
        .insert({
          exploracao_id: formData.exploracao_id,
          tecnico_id: user?.id,
          data_visita: formData.data_visita,
          tipo: formData.tipo,
          objetivo: formData.objetivo || null,
          observacoes: formData.observacoes || null,
          estado: "agendada",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["visitas-tecnicas"] });
      toast({
        title: "Visita agendada",
        description: "A visita técnica foi agendada com sucesso.",
      });
      navigate(`/fiscalizacao/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível agendar a visita. Tente novamente.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.exploracao_id || !formData.data_visita) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor preencha a exploração e a data da visita.",
        variant: "destructive",
      });
      return;
    }

    createVisitaMutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/fiscalizacao">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nova Visita Técnica</h1>
            <p className="text-muted-foreground">
              Agendar uma nova visita de fiscalização
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Dados da Visita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="exploracao">Exploração *</Label>
                  <Select
                    value={formData.exploracao_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, exploracao_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma exploração" />
                    </SelectTrigger>
                    <SelectContent>
                      {exploracoes?.map((exp) => (
                        <SelectItem key={exp.id} value={exp.id}>
                          {exp.designacao} - {exp.municipio}, {exp.provincia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_visita">Data da Visita *</Label>
                  <Input
                    id="data_visita"
                    type="date"
                    value={formData.data_visita}
                    onChange={(e) =>
                      setFormData({ ...formData, data_visita: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Visita *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: VisitType) =>
                      setFormData({ ...formData, tipo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rotina">Rotina</SelectItem>
                      <SelectItem value="fiscalizacao">Fiscalização</SelectItem>
                      <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
                      <SelectItem value="emergencia">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivo">Objetivo da Visita</Label>
                <Textarea
                  id="objetivo"
                  value={formData.objetivo}
                  onChange={(e) =>
                    setFormData({ ...formData, objetivo: e.target.value })
                  }
                  placeholder="Descreva o objetivo principal da visita..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Notas adicionais..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" asChild>
                  <Link to="/fiscalizacao">Cancelar</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={createVisitaMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createVisitaMutation.isPending ? "A guardar..." : "Agendar Visita"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NovaVisita;
