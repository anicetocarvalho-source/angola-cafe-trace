import { useState, useMemo } from "react";
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
import { Plus, Truck, MapPin, Thermometer, Droplets } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import DataTablePagination from "@/components/DataTablePagination";

const Logistica = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;
  const [form, setForm] = useState({
    lote_id: "",
    rota: "",
    veiculo: "",
    temp_media_c: "",
    humidade_media_percent: "",
  });

  const { data: logistica, isLoading, refetch } = useQuery({
    queryKey: ["logistica"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logistica")
        .select("*, lotes!logistica_lote_id_fkey(referencia_lote), entities!logistica_transportador_id_fkey(nome_legal)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: lotes } = useQuery({
    queryKey: ["lotes-for-logistics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lotes").select("id, referencia_lote").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async () => {
    if (!form.lote_id) { toast.error("Seleccione o lote"); return; }
    const { error } = await supabase.from("logistica").insert({
      lote_id: form.lote_id,
      rota: form.rota || null,
      veiculo: form.veiculo || null,
      temp_media_c: form.temp_media_c ? parseFloat(form.temp_media_c) : null,
      humidade_media_percent: form.humidade_media_percent ? parseFloat(form.humidade_media_percent) : null,
      checkpoints: [],
    });
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Registo logístico criado com sucesso");
    setAddOpen(false);
    setForm({ lote_id: "", rota: "", veiculo: "", temp_media_c: "", humidade_media_percent: "" });
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Logística e Transporte</h1>
            <p className="text-muted-foreground">Gestão de movimentos logísticos e cadeia de custódia</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Transporte</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registar Transporte</DialogTitle></DialogHeader>
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
                  <Label>Rota</Label>
                  <Input placeholder="Ex: Kwanza Sul → Luanda" value={form.rota} onChange={e => setForm(p => ({ ...p, rota: e.target.value }))} />
                </div>
                <div>
                  <Label>Veículo</Label>
                  <Input placeholder="Ex: Camião refrigerado" value={form.veiculo} onChange={e => setForm(p => ({ ...p, veiculo: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Temp. Média (°C)</Label><Input type="number" step="0.1" value={form.temp_media_c} onChange={e => setForm(p => ({ ...p, temp_media_c: e.target.value }))} /></div>
                  <div><Label>Humidade Média (%)</Label><Input type="number" step="0.1" value={form.humidade_media_percent} onChange={e => setForm(p => ({ ...p, humidade_media_percent: e.target.value }))} /></div>
                </div>
                <Button onClick={handleSubmit} className="w-full">Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5 text-primary" />Movimentos Logísticos</CardTitle>
            <CardDescription>{logistica?.length || 0} registos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Rota</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Transportador</TableHead>
                  <TableHead>Condições</TableHead>
                  <TableHead>Checkpoints</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logistica?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(l => {
                  const checkpoints = Array.isArray(l.checkpoints) ? l.checkpoints : [];
                  return (
                    <TableRow key={l.id}>
                      <TableCell>{format(parseISO(l.created_at), "dd/MM/yyyy")}</TableCell>
                      <TableCell><Badge variant="outline">{(l as any).lotes?.referencia_lote || "—"}</Badge></TableCell>
                      <TableCell>{l.rota || "—"}</TableCell>
                      <TableCell>{l.veiculo || "—"}</TableCell>
                      <TableCell>{(l as any).entities?.nome_legal || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm">
                          {l.temp_media_c !== null && (
                            <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" />{l.temp_media_c}°C</span>
                          )}
                          {l.humidade_media_percent !== null && (
                            <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{l.humidade_media_percent}%</span>
                          )}
                          {l.temp_media_c === null && l.humidade_media_percent === null && "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{checkpoints.length} checkpoint{checkpoints.length !== 1 ? "s" : ""}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!logistica || logistica.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Sem registos logísticos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <DataTablePagination currentPage={page} totalItems={logistica?.length || 0} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Logistica;
