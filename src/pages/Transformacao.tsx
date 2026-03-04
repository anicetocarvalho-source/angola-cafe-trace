import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { pt } from "date-fns/locale";
import { Plus, FlaskConical, ArrowRight } from "lucide-react";

const Transformacao = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    lote_id: "",
    etapa: "fermentacao",
    data: format(new Date(), "yyyy-MM-dd"),
    rendimento_percent: "",
    parametros: "",
  });

  const { data: transformacoes, isLoading, refetch } = useQuery({
    queryKey: ["transformacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transformacoes")
        .select("*, lotes!transformacoes_lote_id_fkey(referencia_lote)")
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: lotes } = useQuery({
    queryKey: ["lotes-for-transform"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lotes").select("id, referencia_lote").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async () => {
    if (!form.lote_id || !form.etapa) {
      toast.error("Seleccione o lote e a etapa");
      return;
    }
    let parametros_json = null;
    if (form.parametros) {
      try { parametros_json = JSON.parse(form.parametros); } catch { parametros_json = { notas: form.parametros }; }
    }
    const { error } = await supabase.from("transformacoes").insert({
      lote_id: form.lote_id,
      etapa: form.etapa,
      data: form.data,
      rendimento_percent: form.rendimento_percent ? parseFloat(form.rendimento_percent) : null,
      parametros_json,
    });
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Transformação registada com sucesso");
    setAddOpen(false);
    setForm({ lote_id: "", etapa: "fermentacao", data: format(new Date(), "yyyy-MM-dd"), rendimento_percent: "", parametros: "" });
    refetch();
  };

  const etapaLabels: Record<string, string> = {
    fermentacao: "Fermentação",
    lavagem: "Lavagem",
    descasque: "Descasque",
    beneficiamento: "Beneficiamento",
    torrefacao: "Torrefacção",
    moagem: "Moagem",
    outro: "Outro",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transformação</h1>
            <p className="text-muted-foreground">Registo de processos de transformação do café</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Transformação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registar Transformação</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lote *</Label>
                  <Select value={form.lote_id} onValueChange={v => setForm(p => ({ ...p, lote_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Seleccione o lote" /></SelectTrigger>
                    <SelectContent>
                      {lotes?.map(l => <SelectItem key={l.id} value={l.id}>{l.referencia_lote}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Etapa *</Label>
                  <Select value={form.etapa} onValueChange={v => setForm(p => ({ ...p, etapa: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(etapaLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Data</Label><Input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} /></div>
                  <div><Label>Rendimento (%)</Label><Input type="number" step="0.1" placeholder="Ex: 85.5" value={form.rendimento_percent} onChange={e => setForm(p => ({ ...p, rendimento_percent: e.target.value }))} /></div>
                </div>
                <div>
                  <Label>Parâmetros / Notas</Label>
                  <Textarea placeholder="Notas sobre o processo..." value={form.parametros} onChange={e => setForm(p => ({ ...p, parametros: e.target.value }))} />
                </div>
                <Button onClick={handleSubmit} className="w-full">Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" />Registos de Transformação</CardTitle>
            <CardDescription>{transformacoes?.length || 0} registos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Rendimento</TableHead>
                  <TableHead>Parâmetros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transformacoes?.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{format(parseISO(t.data), "dd/MM/yyyy")}</TableCell>
                    <TableCell><Badge variant="outline">{(t as any).lotes?.referencia_lote || "—"}</Badge></TableCell>
                    <TableCell><Badge>{etapaLabels[t.etapa] || t.etapa}</Badge></TableCell>
                    <TableCell>{t.rendimento_percent ? `${t.rendimento_percent}%` : "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {t.parametros_json ? (typeof t.parametros_json === "object" ? JSON.stringify(t.parametros_json) : String(t.parametros_json)) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {(!transformacoes || transformacoes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Sem registos de transformação
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transformacao;
