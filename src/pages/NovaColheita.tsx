import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function NovaColheita() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    parcela_id: "",
    harvest_date: "",
    quantity: "",
    unit: "kg",
    quality_score: "",
    notes: "",
    status: "planned",
  });

  const { data: parcelas } = useQuery({
    queryKey: ['parcelas-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parcelas')
        .select('id, codigo_parcela, exploracao:exploracoes(designacao)')
        .order('codigo_parcela');
      if (error) throw error;
      return data;
    },
  });

  const { data: harvest, isLoading } = useQuery({
    queryKey: ['harvest', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('harvests')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (harvest) {
      setFormData({
        parcela_id: harvest.parcela_id,
        harvest_date: harvest.harvest_date,
        quantity: harvest.quantity.toString(),
        unit: harvest.unit,
        quality_score: harvest.quality_score?.toString() || "",
        notes: harvest.notes || "",
        status: harvest.status,
      });
    }
  }, [harvest]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const payload = {
        ...data,
        quantity: parseFloat(data.quantity),
        quality_score: data.quality_score ? parseFloat(data.quality_score) : null,
        created_by: user.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('harvests')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('harvests')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "Colheita atualizada com sucesso!" : "Colheita criada com sucesso!");
      navigate('/colheitas');
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isEditing && isLoading) return <LoadingSkeleton />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/colheitas')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditing ? 'Editar Colheita' : 'Nova Colheita'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Registe os dados da colheita
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Informações da Colheita</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcela_id">Parcela *</Label>
                  <Select
                    value={formData.parcela_id}
                    onValueChange={(value) => setFormData({ ...formData, parcela_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a parcela" />
                    </SelectTrigger>
                    <SelectContent>
                      {parcelas?.map((parcela) => (
                        <SelectItem key={parcela.id} value={parcela.id}>
                          {parcela.codigo_parcela} - {parcela.exploracao?.designacao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harvest_date">Data da Colheita *</Label>
                  <Input
                    id="harvest_date"
                    type="date"
                    value={formData.harvest_date}
                    onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                      <SelectItem value="ton">Toneladas (ton)</SelectItem>
                      <SelectItem value="saco">Sacos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality_score">Pontuação de Qualidade (0-100)</Label>
                  <Input
                    id="quality_score"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.quality_score}
                    onChange={(e) => setFormData({ ...formData, quality_score: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planeada</SelectItem>
                      <SelectItem value="in_progress">Em Curso</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre a colheita..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/colheitas')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'A guardar...' : (isEditing ? 'Atualizar' : 'Criar Colheita')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}