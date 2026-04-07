import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Coffee } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Torra {
  id: string;
  lote_id: string;
  perfil_torra: string;
  temperatura_max_c: number | null;
  tempo_total_min: number | null;
  perda_peso_percent: number | null;
  data_torra: string;
  observacoes: string | null;
  created_at: string;
  lotes?: { referencia_lote: string };
}

const PERFIS = ["Claro", "Médio-Claro", "Médio", "Médio-Escuro", "Escuro"];

const Torra = () => {
  const { user } = useAuth();
  const [torras, setTorras] = useState<Torra[]>([]);
  const [lotes, setLotes] = useState<{ id: string; referencia_lote: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ lote_id: "", perfil_torra: "", temperatura_max_c: "", tempo_total_min: "", perda_peso_percent: "", data_torra: new Date().toISOString().split("T")[0], observacoes: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: t }, { data: l }] = await Promise.all([
      supabase.from("torras").select("*, lotes(referencia_lote)").order("created_at", { ascending: false }),
      supabase.from("lotes").select("id, referencia_lote").order("created_at", { ascending: false }).limit(100),
    ]);
    setTorras((t as any[]) || []);
    setLotes(l || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.lote_id || !form.perfil_torra || !user) return;
    const { error } = await supabase.from("torras").insert({
      lote_id: form.lote_id,
      perfil_torra: form.perfil_torra,
      temperatura_max_c: form.temperatura_max_c ? parseFloat(form.temperatura_max_c) : null,
      tempo_total_min: form.tempo_total_min ? parseFloat(form.tempo_total_min) : null,
      perda_peso_percent: form.perda_peso_percent ? parseFloat(form.perda_peso_percent) : null,
      data_torra: form.data_torra,
      responsavel_id: user.id,
      observacoes: form.observacoes || null,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Torra registada com sucesso" });
      setDialogOpen(false);
      setForm({ lote_id: "", perfil_torra: "", temperatura_max_c: "", tempo_total_min: "", perda_peso_percent: "", data_torra: new Date().toISOString().split("T")[0], observacoes: "" });
      fetchData();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Torra</h1>
            <p className="text-muted-foreground">Registo de perfis e parâmetros de torra</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Torra</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registar Torra</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lote</Label>
                  <Select value={form.lote_id} onValueChange={(v) => setForm({ ...form, lote_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar lote" /></SelectTrigger>
                    <SelectContent>{lotes.map(l => <SelectItem key={l.id} value={l.id}>{l.referencia_lote}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Perfil de Torra</Label>
                  <Select value={form.perfil_torra} onValueChange={(v) => setForm({ ...form, perfil_torra: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar perfil" /></SelectTrigger>
                    <SelectContent>{PERFIS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Temp. Máx (°C)</Label><Input type="number" value={form.temperatura_max_c} onChange={(e) => setForm({ ...form, temperatura_max_c: e.target.value })} /></div>
                  <div><Label>Tempo (min)</Label><Input type="number" value={form.tempo_total_min} onChange={(e) => setForm({ ...form, tempo_total_min: e.target.value })} /></div>
                  <div><Label>Perda peso (%)</Label><Input type="number" value={form.perda_peso_percent} onChange={(e) => setForm({ ...form, perda_peso_percent: e.target.value })} /></div>
                </div>
                <div><Label>Data</Label><Input type="date" value={form.data_torra} onChange={(e) => setForm({ ...form, data_torra: e.target.value })} /></div>
                <div><Label>Observações</Label><Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
                <Button onClick={handleSubmit} className="w-full" disabled={!form.lote_id || !form.perfil_torra}>Registar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <p className="text-muted-foreground">A carregar...</p> : torras.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Coffee className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Sem torras registadas</p></CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {torras.map((t) => (
              <Card key={t.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t.perfil_torra}</CardTitle>
                  <CardDescription>Lote: {(t as any).lotes?.referencia_lote || t.lote_id.substring(0, 8)} — {new Date(t.data_torra).toLocaleDateString("pt-PT")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Temp. máx:</span> <span className="font-medium">{t.temperatura_max_c ?? "—"}°C</span></div>
                    <div><span className="text-muted-foreground">Tempo:</span> <span className="font-medium">{t.tempo_total_min ?? "—"} min</span></div>
                    <div><span className="text-muted-foreground">Perda:</span> <span className="font-medium">{t.perda_peso_percent ?? "—"}%</span></div>
                  </div>
                  {t.observacoes && <p className="text-sm text-muted-foreground mt-2 italic">{t.observacoes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Torra;
