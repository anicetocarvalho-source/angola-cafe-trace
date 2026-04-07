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
import { Plus, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Embalagem {
  id: string;
  lote_id: string;
  tipo_embalagem: string;
  peso_kg: number;
  data_embalagem: string;
  validade: string | null;
  codigo_lote_final: string | null;
  observacoes: string | null;
  created_at: string;
  lotes?: { referencia_lote: string };
}

const TIPOS = ["Saco Juta 60kg", "Saco GrainPro 60kg", "Saco Vácuo 1kg", "Saco Vácuo 250g", "Caixa 10kg", "Big Bag 1000kg"];

const Embalagem = () => {
  const { user } = useAuth();
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [lotes, setLotes] = useState<{ id: string; referencia_lote: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ lote_id: "", tipo_embalagem: "", peso_kg: "", data_embalagem: new Date().toISOString().split("T")[0], validade: "", codigo_lote_final: "", observacoes: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: e }, { data: l }] = await Promise.all([
      supabase.from("embalagens").select("*, lotes(referencia_lote)").order("created_at", { ascending: false }),
      supabase.from("lotes").select("id, referencia_lote").order("created_at", { ascending: false }).limit(100),
    ]);
    setEmbalagens((e as any[]) || []);
    setLotes(l || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.lote_id || !form.tipo_embalagem || !form.peso_kg || !user) return;
    const { error } = await supabase.from("embalagens").insert({
      lote_id: form.lote_id,
      tipo_embalagem: form.tipo_embalagem,
      peso_kg: parseFloat(form.peso_kg),
      data_embalagem: form.data_embalagem,
      validade: form.validade || null,
      codigo_lote_final: form.codigo_lote_final || null,
      responsavel_id: user.id,
      observacoes: form.observacoes || null,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Embalagem registada com sucesso" });
      setDialogOpen(false);
      setForm({ lote_id: "", tipo_embalagem: "", peso_kg: "", data_embalagem: new Date().toISOString().split("T")[0], validade: "", codigo_lote_final: "", observacoes: "" });
      fetchData();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Embalagem</h1>
            <p className="text-muted-foreground">Registo de embalagem e códigos finais de lote</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Embalagem</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registar Embalagem</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Lote</Label>
                  <Select value={form.lote_id} onValueChange={(v) => setForm({ ...form, lote_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar lote" /></SelectTrigger>
                    <SelectContent>{lotes.map(l => <SelectItem key={l.id} value={l.id}>{l.referencia_lote}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo de Embalagem</Label>
                  <Select value={form.tipo_embalagem} onValueChange={(v) => setForm({ ...form, tipo_embalagem: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                    <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Peso (kg)</Label><Input type="number" value={form.peso_kg} onChange={(e) => setForm({ ...form, peso_kg: e.target.value })} /></div>
                  <div><Label>Código Lote Final</Label><Input value={form.codigo_lote_final} onChange={(e) => setForm({ ...form, codigo_lote_final: e.target.value })} placeholder="Ex: EXP-2026-001" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Data Embalagem</Label><Input type="date" value={form.data_embalagem} onChange={(e) => setForm({ ...form, data_embalagem: e.target.value })} /></div>
                  <div><Label>Validade</Label><Input type="date" value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} /></div>
                </div>
                <div><Label>Observações</Label><Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
                <Button onClick={handleSubmit} className="w-full" disabled={!form.lote_id || !form.tipo_embalagem || !form.peso_kg}>Registar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <p className="text-muted-foreground">A carregar...</p> : embalagens.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Sem embalagens registadas</p></CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {embalagens.map((e) => (
              <Card key={e.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{e.tipo_embalagem}</CardTitle>
                  <CardDescription>Lote: {(e as any).lotes?.referencia_lote || e.lote_id.substring(0, 8)} — {new Date(e.data_embalagem).toLocaleDateString("pt-PT")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Peso:</span> <span className="font-medium">{e.peso_kg} kg</span></div>
                    <div><span className="text-muted-foreground">Código:</span> <span className="font-medium">{e.codigo_lote_final || "—"}</span></div>
                    <div><span className="text-muted-foreground">Validade:</span> <span className="font-medium">{e.validade ? new Date(e.validade).toLocaleDateString("pt-PT") : "—"}</span></div>
                  </div>
                  {e.observacoes && <p className="text-sm text-muted-foreground mt-2 italic">{e.observacoes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Embalagem;
