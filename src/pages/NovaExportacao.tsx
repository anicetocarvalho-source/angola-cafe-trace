import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Ship, Package } from "lucide-react";

interface Lote {
  id: string;
  referencia_lote: string;
  volume_kg: number;
  tipo: string;
}

interface Entity {
  id: string;
  nome_legal: string;
  tipo: string;
}

const NovaExportacao = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [exportadores, setExportadores] = useState<Entity[]>([]);
  const [lotesSelecionados, setLotesSelecionados] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    exportador_id: "",
    pais_destino: "",
    porto: "",
    navio: "",
    booking: "",
    bl_ref: "",
    du_ref: "",
    data_embarque: "",
    status: "preparacao",
  });

  useEffect(() => {
    fetchLotes();
    fetchExportadores();
  }, []);

  const fetchLotes = async () => {
    try {
      const { data, error } = await supabase
        .from("lotes")
        .select("id, referencia_lote, volume_kg, tipo")
        .eq("estado", "aprovado")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLotes(data || []);
    } catch (error) {
      console.error("Error fetching lotes:", error);
      toast.error("Erro ao carregar lotes");
    }
  };

  const fetchExportadores = async () => {
    try {
      const { data, error } = await supabase
        .from("entities")
        .select("id, nome_legal, tipo")
        .eq("tipo", "exportador")
        .order("nome_legal");

      if (error) throw error;
      setExportadores(data || []);
    } catch (error) {
      console.error("Error fetching exportadores:", error);
      toast.error("Erro ao carregar exportadores");
    }
  };

  const handleLoteToggle = (loteId: string) => {
    setLotesSelecionados((prev) =>
      prev.includes(loteId) ? prev.filter((id) => id !== loteId) : [...prev, loteId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lotesSelecionados.length === 0) {
      toast.error("Seleccione pelo menos um lote para exportação");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("exportacoes").insert({
        exportador_id: formData.exportador_id,
        lote_ids: lotesSelecionados,
        pais_destino: formData.pais_destino,
        porto: formData.porto || null,
        navio: formData.navio || null,
        booking: formData.booking || null,
        bl_ref: formData.bl_ref || null,
        du_ref: formData.du_ref || null,
        data_embarque: formData.data_embarque || null,
        status: formData.status,
      });

      if (error) throw error;

      toast.success("Exportação registada com sucesso!");
      navigate("/exportacao");
    } catch (error: any) {
      console.error("Error creating export:", error);
      toast.error(error.message || "Erro ao registar exportação");
    } finally {
      setLoading(false);
    }
  };

  const volumeTotal = lotes
    .filter((l) => lotesSelecionados.includes(l.id))
    .reduce((sum, l) => sum + Number(l.volume_kg), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/exportacao")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <Ship className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nova Exportação</h1>
              <p className="text-muted-foreground">Preparar exportação de lotes certificados</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Exportação */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Exportação</CardTitle>
              <CardDescription>Informações do embarque e destino</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exportador_id">Exportador *</Label>
                  <Select
                    value={formData.exportador_id}
                    onValueChange={(value) => setFormData({ ...formData, exportador_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o exportador" />
                    </SelectTrigger>
                    <SelectContent>
                      {exportadores.map((exp) => (
                        <SelectItem key={exp.id} value={exp.id}>
                          {exp.nome_legal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais_destino">País de Destino *</Label>
                  <Input
                    id="pais_destino"
                    value={formData.pais_destino}
                    onChange={(e) => setFormData({ ...formData, pais_destino: e.target.value })}
                    placeholder="Ex: Alemanha"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="porto">Porto</Label>
                  <Input
                    id="porto"
                    value={formData.porto}
                    onChange={(e) => setFormData({ ...formData, porto: e.target.value })}
                    placeholder="Ex: Porto de Luanda"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="navio">Navio</Label>
                  <Input
                    id="navio"
                    value={formData.navio}
                    onChange={(e) => setFormData({ ...formData, navio: e.target.value })}
                    placeholder="Nome do navio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking">Booking</Label>
                  <Input
                    id="booking"
                    value={formData.booking}
                    onChange={(e) => setFormData({ ...formData, booking: e.target.value })}
                    placeholder="Número de reserva"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_embarque">Data de Embarque</Label>
                  <Input
                    id="data_embarque"
                    type="date"
                    value={formData.data_embarque}
                    onChange={(e) => setFormData({ ...formData, data_embarque: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bl_ref">Referência BL</Label>
                  <Input
                    id="bl_ref"
                    value={formData.bl_ref}
                    onChange={(e) => setFormData({ ...formData, bl_ref: e.target.value })}
                    placeholder="Bill of Lading"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="du_ref">Referência DU</Label>
                  <Input
                    id="du_ref"
                    value={formData.du_ref}
                    onChange={(e) => setFormData({ ...formData, du_ref: e.target.value })}
                    placeholder="Documento Único"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selecção de Lotes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lotes para Exportação</CardTitle>
                  <CardDescription>
                    Seleccione os lotes aprovados a incluir nesta exportação
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{lotesSelecionados.length} lotes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{volumeTotal.toFixed(0)} kg</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {lotes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Não há lotes aprovados disponíveis
                </p>
              ) : (
                <div className="space-y-2">
                  {lotes.map((lote) => (
                    <div
                      key={lote.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={lote.id}
                          checked={lotesSelecionados.includes(lote.id)}
                          onCheckedChange={() => handleLoteToggle(lote.id)}
                        />
                        <Label htmlFor={lote.id} className="cursor-pointer">
                          <span className="font-medium">{lote.referencia_lote}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {lote.tipo} • {lote.volume_kg} kg
                          </span>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "A registar..." : "Registar Exportação"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/exportacao")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NovaExportacao;
