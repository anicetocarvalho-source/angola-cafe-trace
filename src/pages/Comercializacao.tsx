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
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Plus, Handshake, DollarSign } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

const Comercializacao = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    lote_id: "",
    contrato_ref: "",
    preco_unitario: "",
    quantidade_kg: "",
    moeda: "USD",
    incoterm: "FOB",
    data_contrato: format(new Date(), "yyyy-MM-dd"),
    comprador_id: "",
  });

  const { data: vendas, isLoading, refetch } = useQuery({
    queryKey: ["comercializacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comercializacao")
        .select("*, lotes!comercializacao_lote_id_fkey(referencia_lote), entities!comercializacao_comprador_id_fkey(nome_legal)")
        .order("data_contrato", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: lotes } = useQuery({
    queryKey: ["lotes-for-sales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lotes").select("id, referencia_lote").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: buyers } = useQuery({
    queryKey: ["buyers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("entities").select("id, nome_legal").order("nome_legal");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async () => {
    if (!form.lote_id) { toast.error("Seleccione o lote"); return; }
    const { error } = await supabase.from("comercializacao").insert({
      lote_id: form.lote_id,
      contrato_ref: form.contrato_ref || null,
      preco_unitario: form.preco_unitario ? parseFloat(form.preco_unitario) : null,
      quantidade_kg: form.quantidade_kg ? parseFloat(form.quantidade_kg) : null,
      moeda: form.moeda || null,
      incoterm: form.incoterm || null,
      data_contrato: form.data_contrato || null,
      comprador_id: form.comprador_id || null,
    });
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Contrato registado com sucesso");
    setAddOpen(false);
    setForm({ lote_id: "", contrato_ref: "", preco_unitario: "", quantidade_kg: "", moeda: "USD", incoterm: "FOB", data_contrato: format(new Date(), "yyyy-MM-dd"), comprador_id: "" });
    refetch();
  };

  const formatCurrency = (value: number | null, currency: string | null) => {
    if (value === null) return "—";
    if (currency === "USD") return `$${value.toFixed(2)}`;
    if (currency === "AKZ") return `${value.toLocaleString("pt-AO")} Kz`;
    return `${value.toFixed(2)} ${currency || ""}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Comercialização</h1>
            <p className="text-muted-foreground">Gestão de contratos e vendas de café</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Contrato</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registar Contrato de Venda</DialogTitle></DialogHeader>
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
                  <Label>Comprador</Label>
                  <Select value={form.comprador_id} onValueChange={v => setForm(p => ({ ...p, comprador_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Seleccione o comprador" /></SelectTrigger>
                    <SelectContent>
                      {buyers?.map(b => <SelectItem key={b.id} value={b.id}>{b.nome_legal}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ref. Contrato</Label>
                  <Input placeholder="Ex: CT-2026-001" value={form.contrato_ref} onChange={e => setForm(p => ({ ...p, contrato_ref: e.target.value }))} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label>Preço/kg</Label><Input type="number" step="0.01" value={form.preco_unitario} onChange={e => setForm(p => ({ ...p, preco_unitario: e.target.value }))} /></div>
                  <div><Label>Qtd. (kg)</Label><Input type="number" value={form.quantidade_kg} onChange={e => setForm(p => ({ ...p, quantidade_kg: e.target.value }))} /></div>
                  <div><Label>Moeda</Label>
                    <Select value={form.moeda} onValueChange={v => setForm(p => ({ ...p, moeda: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="AKZ">AKZ</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Incoterm</Label>
                    <Select value={form.incoterm} onValueChange={v => setForm(p => ({ ...p, incoterm: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOB">FOB</SelectItem>
                        <SelectItem value="CIF">CIF</SelectItem>
                        <SelectItem value="EXW">EXW</SelectItem>
                        <SelectItem value="FCA">FCA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Data Contrato</Label><Input type="date" value={form.data_contrato} onChange={e => setForm(p => ({ ...p, data_contrato: e.target.value }))} /></div>
                </div>
                <Button onClick={handleSubmit} className="w-full">Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5 text-primary" />Contratos e Vendas</CardTitle>
            <CardDescription>{vendas?.length || 0} registos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Preço/kg</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Incoterm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas?.map(v => {
                  const total = v.preco_unitario && v.quantidade_kg ? v.preco_unitario * v.quantidade_kg : null;
                  return (
                    <TableRow key={v.id}>
                      <TableCell>{v.data_contrato ? format(parseISO(v.data_contrato), "dd/MM/yyyy") : "—"}</TableCell>
                      <TableCell><Badge variant="outline">{v.contrato_ref || "—"}</Badge></TableCell>
                      <TableCell>{(v as any).lotes?.referencia_lote || "—"}</TableCell>
                      <TableCell>{(v as any).entities?.nome_legal || "—"}</TableCell>
                      <TableCell>{v.quantidade_kg ? `${v.quantidade_kg.toLocaleString("pt-AO")} kg` : "—"}</TableCell>
                      <TableCell>{formatCurrency(v.preco_unitario, v.moeda)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(total, v.moeda)}</TableCell>
                      <TableCell><Badge variant="secondary">{v.incoterm || "—"}</Badge></TableCell>
                    </TableRow>
                  );
                })}
                {(!vendas || vendas.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      <Handshake className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Sem contratos registados
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

export default Comercializacao;
