import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, ClipboardCheck, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChecklistItem {
  nome: string;
  valor: string | number | null;
  limite_min?: number;
  limite_max?: number;
  conforme: boolean | null;
}

interface Checklist {
  id: string;
  lote_id: string;
  etapa: string;
  tecnico_id: string;
  data_verificacao: string;
  itens: ChecklistItem[];
  resultado: string;
  observacoes: string | null;
  limites_pcc: Record<string, any>;
  alertas_gerados: boolean;
  created_at: string;
  lotes?: { referencia_lote: string };
}

const ETAPAS = [
  "Recepção Cereja",
  "Fermentação",
  "Lavagem",
  "Secagem",
  "Benefício",
  "Torra",
  "Embalagem",
  "Armazenamento",
  "Expedição",
];

const PCC_TEMPLATES: Record<string, ChecklistItem[]> = {
  "Recepção Cereja": [
    { nome: "Percentagem frutos maduros (%)", valor: null, limite_min: 85, limite_max: 100, conforme: null },
    { nome: "Presença de corpos estranhos", valor: null, conforme: null },
    { nome: "Volume recebido (kg)", valor: null, conforme: null },
  ],
  "Secagem": [
    { nome: "Humidade inicial (%)", valor: null, conforme: null },
    { nome: "Humidade final (%)", valor: null, limite_min: 10, limite_max: 12.5, conforme: null },
    { nome: "Temperatura máxima (°C)", valor: null, limite_max: 40, conforme: null },
    { nome: "Uniformidade de secagem", valor: null, conforme: null },
  ],
  "Torra": [
    { nome: "Temperatura máxima (°C)", valor: null, limite_max: 230, conforme: null },
    { nome: "Tempo total (min)", valor: null, conforme: null },
    { nome: "Perda de peso (%)", valor: null, limite_min: 12, limite_max: 20, conforme: null },
    { nome: "Cor uniforme", valor: null, conforme: null },
  ],
  "Armazenamento": [
    { nome: "Temperatura armazém (°C)", valor: null, limite_max: 25, conforme: null },
    { nome: "Humidade relativa (%)", valor: null, limite_max: 65, conforme: null },
    { nome: "Estado da embalagem", valor: null, conforme: null },
    { nome: "Presença de pragas", valor: null, conforme: null },
  ],
};

const Checklists = () => {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [lotes, setLotes] = useState<{ id: string; referencia_lote: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [selectedLote, setSelectedLote] = useState("");
  const [selectedEtapa, setSelectedEtapa] = useState("");
  const [itens, setItens] = useState<ChecklistItem[]>([]);
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: checklistsData }, { data: lotesData }] = await Promise.all([
      supabase.from("checklists").select("*, lotes(referencia_lote)").order("created_at", { ascending: false }),
      supabase.from("lotes").select("id, referencia_lote").order("created_at", { ascending: false }).limit(100),
    ]);
    setChecklists((checklistsData as any[]) || []);
    setLotes(lotesData || []);
    setLoading(false);
  };

  const handleEtapaChange = (etapa: string) => {
    setSelectedEtapa(etapa);
    setItens(PCC_TEMPLATES[etapa] || [
      { nome: "Verificação geral", valor: null, conforme: null },
    ]);
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setItens(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      // Auto-check conformity against limits
      if (field === "valor" && value !== null && value !== "") {
        const numVal = parseFloat(value);
        if (!isNaN(numVal)) {
          if (updated.limite_min !== undefined && updated.limite_max !== undefined) {
            updated.conforme = numVal >= updated.limite_min && numVal <= updated.limite_max;
          } else if (updated.limite_max !== undefined) {
            updated.conforme = numVal <= updated.limite_max;
          } else if (updated.limite_min !== undefined) {
            updated.conforme = numVal >= updated.limite_min;
          }
        }
      }
      if (field === "conforme") {
        updated.conforme = value;
      }
      return updated;
    }));
  };

  const handleSubmit = async () => {
    if (!selectedLote || !selectedEtapa || !user) return;

    const hasNonConformity = itens.some(i => i.conforme === false);
    const allChecked = itens.every(i => i.conforme !== null);
    const resultado = !allChecked ? "pendente" : hasNonConformity ? "reprovado" : "aprovado";

    const { error } = await supabase.from("checklists").insert({
      lote_id: selectedLote,
      etapa: selectedEtapa,
      tecnico_id: user.id,
      itens: itens as any,
      resultado,
      observacoes: observacoes || null,
      limites_pcc: PCC_TEMPLATES[selectedEtapa] ? { template: selectedEtapa } : {},
      alertas_gerados: hasNonConformity,
    });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Checklist registada", description: `Resultado: ${resultado}` });
      if (hasNonConformity) {
        toast({ title: "⚠️ Alerta PCC", description: "Foram detectados valores fora dos limites aceitáveis!", variant: "destructive" });
      }
      setDialogOpen(false);
      setSelectedLote("");
      setSelectedEtapa("");
      setItens([]);
      setObservacoes("");
      fetchData();
    }
  };

  const getResultBadge = (resultado: string) => {
    const map: Record<string, string> = {
      aprovado: "bg-green-500/10 text-green-700 border-green-200",
      reprovado: "bg-red-500/10 text-red-700 border-red-200",
      pendente: "bg-amber-500/10 text-amber-700 border-amber-200",
    };
    return <Badge variant="outline" className={map[resultado] || ""}>{resultado}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Checklists & PCC</h1>
            <p className="text-muted-foreground">Verificações de Pontos Críticos de Controlo por etapa</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Checklist</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Checklist de Verificação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lote</Label>
                    <Select value={selectedLote} onValueChange={setSelectedLote}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar lote" /></SelectTrigger>
                      <SelectContent>
                        {lotes.map(l => (
                          <SelectItem key={l.id} value={l.id}>{l.referencia_lote}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Etapa</Label>
                    <Select value={selectedEtapa} onValueChange={handleEtapaChange}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar etapa" /></SelectTrigger>
                      <SelectContent>
                        {ETAPAS.map(e => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {itens.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Itens de Verificação</Label>
                    {itens.map((item, idx) => (
                      <div key={idx} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{item.nome}</p>
                          {(item.limite_min !== undefined || item.limite_max !== undefined) && (
                            <span className="text-xs text-muted-foreground">
                              Limites: {item.limite_min ?? "—"} – {item.limite_max ?? "—"}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Valor observado"
                            value={item.valor ?? ""}
                            onChange={(e) => updateItem(idx, "valor", e.target.value)}
                            className="flex-1"
                          />
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant={item.conforme === true ? "default" : "outline"}
                              onClick={() => updateItem(idx, "conforme", true)}
                              className="text-xs"
                            >
                              ✓ OK
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={item.conforme === false ? "destructive" : "outline"}
                              onClick={() => updateItem(idx, "conforme", false)}
                              className="text-xs"
                            >
                              ✗ NC
                            </Button>
                          </div>
                        </div>
                        {item.conforme === false && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Não conforme — valor fora dos limites PCC
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <Label>Observações</Label>
                  <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações adicionais..." />
                </div>

                <Button onClick={handleSubmit} className="w-full" disabled={!selectedLote || !selectedEtapa}>
                  Registar Checklist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-muted-foreground">A carregar...</p>
        ) : checklists.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Sem checklists registadas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {checklists.map((cl) => (
              <Card key={cl.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{cl.etapa}</CardTitle>
                    <div className="flex items-center gap-2">
                      {cl.alertas_gerados && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />Alerta PCC
                        </Badge>
                      )}
                      {getResultBadge(cl.resultado)}
                    </div>
                  </div>
                  <CardDescription>
                    Lote: {(cl as any).lotes?.referencia_lote || cl.lote_id.substring(0, 8)} — {new Date(cl.data_verificacao).toLocaleDateString("pt-PT")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    {(cl.itens as unknown as ChecklistItem[]).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                        <span>{item.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{item.valor ?? "—"}</span>
                          {item.conforme === true && <Badge variant="outline" className="text-green-600 text-xs">OK</Badge>}
                          {item.conforme === false && <Badge variant="destructive" className="text-xs">NC</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {cl.observacoes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">{cl.observacoes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Checklists;
