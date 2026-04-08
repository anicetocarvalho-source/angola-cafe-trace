import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Scissors, Merge, Package, ArrowRight, X, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubLote {
  volume_kg: number;
  tipo: string;
  observacao: string;
}

const LoteOperacoes = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Split state
  const [selectedLoteForSplit, setSelectedLoteForSplit] = useState<string>("");
  const [subLotes, setSubLotes] = useState<SubLote[]>([
    { volume_kg: 0, tipo: "cereja", observacao: "" },
    { volume_kg: 0, tipo: "cereja", observacao: "" },
  ]);

  // Blend state
  const [selectedLotesForBlend, setSelectedLotesForBlend] = useState<string[]>([]);
  const [blendTipo, setBlendTipo] = useState<string>("cafe_verde");
  const [blendObservacao, setBlendObservacao] = useState("");

  const { data: lotes, isLoading } = useQuery({
    queryKey: ["lotes-operacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotes")
        .select("id, referencia_lote, tipo, volume_kg, estado")
        .in("estado", ["pendente", "em_processo", "aprovado"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const parentLote = lotes?.find((l) => l.id === selectedLoteForSplit);
  const totalSubVolume = subLotes.reduce((sum, s) => sum + (s.volume_kg || 0), 0);
  const remainingVolume = parentLote ? parentLote.volume_kg - totalSubVolume : 0;

  const splitMutation = useMutation({
    mutationFn: async () => {
      if (!parentLote) throw new Error("Selecione um lote");
      if (totalSubVolume > parentLote.volume_kg) throw new Error("Volume dos sub-lotes excede o lote original");
      if (subLotes.some((s) => s.volume_kg <= 0)) throw new Error("Todos os sub-lotes devem ter volume > 0");

      const results = [];
      for (const sub of subLotes) {
        const { data, error } = await supabase
          .from("lotes")
          .insert({
            referencia_lote: `TEMP-${Date.now()}-${idx}`,
            volume_kg: sub.volume_kg,
            tipo: sub.tipo as any,
            tipo_transformacao: "divisao",
            parent_lote_ids: [parentLote.id],
          })
          .select()
          .single();
        if (error) throw error;
        results.push(data);
      }

      // Update parent volume if fully consumed
      if (remainingVolume <= 0) {
        await supabase
          .from("lotes")
          .update({ estado: "consumido" as any })
          .eq("id", parentLote.id);
      } else {
        await supabase
          .from("lotes")
          .update({ volume_kg: remainingVolume })
          .eq("id", parentLote.id);
      }

      return results;
    },
    onSuccess: (data) => {
      toast({
        title: "Divisão concluída",
        description: `${data.length} sub-lotes criados com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ["lotes-operacoes"] });
      setSelectedLoteForSplit("");
      setSubLotes([
        { volume_kg: 0, tipo: "cereja", observacao: "" },
        { volume_kg: 0, tipo: "cereja", observacao: "" },
      ]);
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const blendMutation = useMutation({
    mutationFn: async () => {
      if (selectedLotesForBlend.length < 2) throw new Error("Selecione pelo menos 2 lotes");

      const selectedData = lotes?.filter((l) => selectedLotesForBlend.includes(l.id)) || [];
      const totalVolume = selectedData.reduce((sum, l) => sum + l.volume_kg, 0);

      const { data, error } = await supabase
        .from("lotes")
        .insert({
          referencia_lote: `TEMP-BLEND-${Date.now()}`,
          volume_kg: totalVolume,
          tipo: blendTipo as any,
          tipo_transformacao: "blend",
          parent_lote_ids: selectedLotesForBlend,
        })
        .select()
        .single();
      if (error) throw error;

      // Mark parent lots as consumed
      for (const id of selectedLotesForBlend) {
        await supabase
          .from("lotes")
          .update({ estado: "consumido" as any })
          .eq("id", id);
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Blend criado",
        description: `Lote ${data.referencia_lote} criado com ${selectedLotesForBlend.length} lotes agregados.`,
      });
      queryClient.invalidateQueries({ queryKey: ["lotes-operacoes"] });
      setSelectedLotesForBlend([]);
      setBlendObservacao("");
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const addSubLote = () => {
    setSubLotes([...subLotes, { volume_kg: 0, tipo: parentLote?.tipo || "cereja", observacao: "" }]);
  };

  const removeSubLote = (idx: number) => {
    if (subLotes.length <= 2) return;
    setSubLotes(subLotes.filter((_, i) => i !== idx));
  };

  const updateSubLote = (idx: number, field: keyof SubLote, value: any) => {
    const updated = [...subLotes];
    updated[idx] = { ...updated[idx], [field]: value };
    setSubLotes(updated);
  };

  const toggleBlendLote = (id: string) => {
    setSelectedLotesForBlend((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedBlendLotes = lotes?.filter((l) => selectedLotesForBlend.includes(l.id)) || [];
  const blendTotalVolume = selectedBlendLotes.reduce((sum, l) => sum + l.volume_kg, 0);

  const tipoLabels: Record<string, string> = {
    cereja: "Cereja",
    cafe_verde: "Café Verde",
    parchment: "Pergaminho",
    torrado: "Torrado",
    moido: "Moído",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Divisão & Agregação de Lotes</h1>
          <p className="text-muted-foreground text-sm">Dividir lotes em sub-lotes ou agregar múltiplos lotes num blend</p>
        </div>

        <Tabs defaultValue="split" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="split" className="gap-2">
              <Scissors className="h-4 w-4" />
              Dividir Lote
            </TabsTrigger>
            <TabsTrigger value="blend" className="gap-2">
              <Merge className="h-4 w-4" />
              Criar Blend
            </TabsTrigger>
          </TabsList>

          {/* ========== SPLIT TAB ========== */}
          <TabsContent value="split">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Source lot */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lote Original</CardTitle>
                  <CardDescription>Selecione o lote a dividir</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedLoteForSplit} onValueChange={(v) => {
                    setSelectedLoteForSplit(v);
                    const lot = lotes?.find((l) => l.id === v);
                    if (lot) {
                      setSubLotes([
                        { volume_kg: Math.floor(lot.volume_kg / 2), tipo: lot.tipo, observacao: "" },
                        { volume_kg: lot.volume_kg - Math.floor(lot.volume_kg / 2), tipo: lot.tipo, observacao: "" },
                      ]);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar lote..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lotes?.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.referencia_lote} — {l.volume_kg}kg ({tipoLabels[l.tipo] || l.tipo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {parentLote && (
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Referência</span>
                        <span className="font-mono text-sm">{parentLote.referencia_lote}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Volume Total</span>
                        <span className="font-semibold">{parentLote.volume_kg} kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Tipo</span>
                        <Badge variant="outline">{tipoLabels[parentLote.tipo] || parentLote.tipo}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Restante</span>
                        <span className={`font-semibold ${remainingVolume < 0 ? "text-destructive" : "text-secondary"}`}>
                          {remainingVolume} kg
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sub-lots */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Sub-Lotes</CardTitle>
                      <CardDescription>{subLotes.length} sub-lotes definidos</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={addSubLote}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subLotes.map((sub, idx) => (
                    <div key={idx} className="rounded-lg border p-4 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Sub-lote {idx + 1}</span>
                        {subLotes.length > 2 && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSubLote(idx)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Volume (kg)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={sub.volume_kg || ""}
                            onChange={(e) => updateSubLote(idx, "volume_kg", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo</Label>
                          <Select value={sub.tipo} onValueChange={(v) => updateSubLote(idx, "tipo", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(tipoLabels).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Visual flow */}
                  {parentLote && (
                    <div className="flex items-center justify-center gap-3 py-4">
                      <div className="rounded-lg bg-primary/10 border border-primary/30 px-3 py-2 text-center">
                        <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-xs font-medium">{parentLote.volume_kg}kg</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex gap-2">
                        {subLotes.map((s, i) => (
                          <div key={i} className="rounded-lg bg-secondary/10 border border-secondary/30 px-3 py-2 text-center">
                            <Package className="h-4 w-4 mx-auto mb-1 text-secondary" />
                            <p className="text-xs font-medium">{s.volume_kg}kg</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    disabled={!parentLote || remainingVolume < 0 || splitMutation.isPending}
                    onClick={() => splitMutation.mutate()}
                  >
                    <Scissors className="h-4 w-4 mr-2" />
                    {splitMutation.isPending ? "A dividir..." : "Confirmar Divisão"}
                  </Button>
                  {remainingVolume < 0 && (
                    <p className="text-xs text-destructive text-center">
                      Volume dos sub-lotes excede o lote original em {Math.abs(remainingVolume)}kg
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========== BLEND TAB ========== */}
          <TabsContent value="blend">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Lot selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selecionar Lotes</CardTitle>
                  <CardDescription>Escolha os lotes a agregar (mín. 2)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                      <p className="text-muted-foreground text-sm">A carregar...</p>
                    ) : (
                      lotes?.map((l) => (
                        <label
                          key={l.id}
                          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                            selectedLotesForBlend.includes(l.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            checked={selectedLotesForBlend.includes(l.id)}
                            onCheckedChange={() => toggleBlendLote(l.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{l.referencia_lote}</p>
                            <p className="text-xs text-muted-foreground">
                              {tipoLabels[l.tipo] || l.tipo} — {l.volume_kg}kg
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {l.estado}
                          </Badge>
                        </label>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Blend config */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurar Blend</CardTitle>
                  <CardDescription>Defina o tipo do lote resultante</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo do Blend</Label>
                    <Select value={blendTipo} onValueChange={setBlendTipo}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(tipoLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={blendObservacao}
                      onChange={(e) => setBlendObservacao(e.target.value)}
                      placeholder="Notas sobre o blend..."
                      rows={3}
                    />
                  </div>

                  {/* Visual flow */}
                  {selectedBlendLotes.length > 0 && (
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                      <p className="text-sm font-medium">Resumo do Blend</p>
                      <div className="flex items-center justify-center gap-3 py-2">
                        <div className="flex gap-1 flex-wrap justify-center">
                          {selectedBlendLotes.map((l) => (
                            <div key={l.id} className="rounded bg-muted border px-2 py-1 text-center">
                              <p className="text-[10px] font-mono">{l.referencia_lote.slice(-8)}</p>
                              <p className="text-xs font-medium">{l.volume_kg}kg</p>
                            </div>
                          ))}
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 text-center">
                          <Merge className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <p className="text-sm font-bold">{blendTotalVolume}kg</p>
                          <p className="text-[10px] text-muted-foreground">{tipoLabels[blendTipo]}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Lotes:</span>{" "}
                          <span className="font-medium">{selectedBlendLotes.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Volume total:</span>{" "}
                          <span className="font-medium">{blendTotalVolume}kg</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    disabled={selectedLotesForBlend.length < 2 || blendMutation.isPending}
                    onClick={() => blendMutation.mutate()}
                  >
                    <Merge className="h-4 w-4 mr-2" />
                    {blendMutation.isPending ? "A criar blend..." : "Confirmar Blend"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LoteOperacoes;
