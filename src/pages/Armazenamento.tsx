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
import { Plus, Warehouse, ArrowDownToLine, ArrowUpFromLine, Thermometer, Droplets } from "lucide-react";

const Armazenamento = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    lote_id: "",
    armazem_nome: "",
    tipo_movimento: "entrada",
    quantidade_kg: "",
    data_movimento: format(new Date(), "yyyy-MM-dd"),
    temperatura_c: "",
    humidade_percent: "",
    localizacao_armazem: "",
    responsavel: "",
    observacoes: "",
  });

  const { data: registos, isLoading, refetch } = useQuery({
    queryKey: ["armazenamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("armazenamento")
        .select("*, lotes!armazenamento_lote_id_fkey(referencia_lote)")
        .order("data_movimento", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: lotes } = useQuery({
    queryKey: ["lotes-for-storage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotes")
        .select("id, referencia_lote")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate stock summary per lot
  const stockSummary = registos?.reduce((acc, r) => {
    const loteRef = (r as any).lotes?.referencia_lote || r.lote_id;
    if (!acc[loteRef]) acc[loteRef] = { entrada: 0, saida: 0, armazem: r.armazem_nome };
    if (r.tipo_movimento === "entrada") acc[loteRef].entrada += Number(r.quantidade_kg);
    else acc[loteRef].saida += Number(r.quantidade_kg);
    return acc;
  }, {} as Record<string, { entrada: number; saida: number; armazem: string }>);

  const handleSubmit = async () => {
    if (!form.lote_id || !form.armazem_nome || !form.quantidade_kg) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    const { error } = await supabase.from("armazenamento").insert({
      lote_id: form.lote_id,
      armazem_nome: form.armazem_nome,
      tipo_movimento: form.tipo_movimento,
      quantidade_kg: parseFloat(form.quantidade_kg),
      data_movimento: form.data_movimento,
      temperatura_c: form.temperatura_c ? parseFloat(form.temperatura_c) : null,
      humidade_percent: form.humidade_percent ? parseFloat(form.humidade_percent) : null,
      localizacao_armazem: form.localizacao_armazem || null,
      responsavel: form.responsavel || null,
      observacoes: form.observacoes || null,
    });
    if (error) {
      toast.error("Erro: " + error.message);
      return;
    }
    toast.success("Registo de armazenamento criado com sucesso");
    setAddOpen(false);
    setForm({
      lote_id: "", armazem_nome: "", tipo_movimento: "entrada", quantidade_kg: "",
      data_movimento: format(new Date(), "yyyy-MM-dd"), temperatura_c: "",
      humidade_percent: "", localizacao_armazem: "", responsavel: "", observacoes: "",
    });
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Armazenamento</h1>
            <p className="text-muted-foreground">Gestão de stock, entradas e saídas por lote</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Movimento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registar Movimento de Armazém</DialogTitle></DialogHeader>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Armazém *</Label>
                    <Input placeholder="Ex: Armazém Central Uíge" value={form.armazem_nome} onChange={e => setForm(p => ({ ...p, armazem_nome: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Tipo *</Label>
                    <Select value={form.tipo_movimento} onValueChange={v => setForm(p => ({ ...p, tipo_movimento: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantidade (kg) *</Label>
                    <Input type="number" step="0.1" value={form.quantidade_kg} onChange={e => setForm(p => ({ ...p, quantidade_kg: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Data</Label>
                    <Input type="date" value={form.data_movimento} onChange={e => setForm(p => ({ ...p, data_movimento: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Temperatura (°C)</Label>
                    <Input type="number" step="0.1" placeholder="Ex: 22.5" value={form.temperatura_c} onChange={e => setForm(p => ({ ...p, temperatura_c: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Humidade (%)</Label>
                    <Input type="number" step="0.1" placeholder="Ex: 65" value={form.humidade_percent} onChange={e => setForm(p => ({ ...p, humidade_percent: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Localização do Armazém</Label>
                  <Input placeholder="Ex: Uíge, Angola" value={form.localizacao_armazem} onChange={e => setForm(p => ({ ...p, localizacao_armazem: e.target.value }))} />
                </div>
                <div>
                  <Label>Responsável</Label>
                  <Input placeholder="Nome do responsável" value={form.responsavel} onChange={e => setForm(p => ({ ...p, responsavel: e.target.value }))} />
                </div>
                <div>
                  <Label>Observações</Label>
                  <Textarea placeholder="Notas adicionais..." value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />
                </div>
                <Button onClick={handleSubmit} className="w-full">Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stock Summary Cards */}
        {stockSummary && Object.keys(stockSummary).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stockSummary).map(([lote, data]) => {
              const saldo = data.entrada - data.saida;
              return (
                <Card key={lote}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{lote}</CardTitle>
                    <CardDescription>{data.armazem}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{saldo.toLocaleString("pt-AO")} kg</div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><ArrowDownToLine className="h-3 w-3 text-green-600" />{data.entrada.toLocaleString("pt-AO")} kg</span>
                      <span className="flex items-center gap-1"><ArrowUpFromLine className="h-3 w-3 text-red-600" />{data.saida.toLocaleString("pt-AO")} kg</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Movement History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Warehouse className="h-5 w-5 text-primary" />Movimentos de Armazém</CardTitle>
            <CardDescription>{registos?.length || 0} registos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Armazém</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Condições</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registos?.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>{format(parseISO(r.data_movimento), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={r.tipo_movimento === "entrada" ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
                        {r.tipo_movimento === "entrada"
                          ? <><ArrowDownToLine className="h-3 w-3" />Entrada</>
                          : <><ArrowUpFromLine className="h-3 w-3" />Saída</>}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant="outline">{(r as any).lotes?.referencia_lote || "—"}</Badge></TableCell>
                    <TableCell>{r.armazem_nome}</TableCell>
                    <TableCell className="font-medium">{Number(r.quantidade_kg).toLocaleString("pt-AO")} kg</TableCell>
                    <TableCell>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {r.temperatura_c != null && <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" />{r.temperatura_c}°C</span>}
                        {r.humidade_percent != null && <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{r.humidade_percent}%</span>}
                        {r.temperatura_c == null && r.humidade_percent == null && "—"}
                      </div>
                    </TableCell>
                    <TableCell>{r.responsavel || "—"}</TableCell>
                  </TableRow>
                ))}
                {(!registos || registos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      <Warehouse className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Sem registos de armazenamento
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

export default Armazenamento;
