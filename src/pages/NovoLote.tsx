import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  colheita_id: z.string().optional(),
  tipo: z.string().min(1, "Tipo obrigatório"),
  volume_kg: z.string().min(1, "Volume obrigatório"),
  humidade_percent: z.string().optional(),
  temperatura_c: z.string().optional(),
});

interface Colheita {
  id: string;
  campanha: string;
  parcelas: {
    codigo_parcela: string;
    exploracoes: {
      designacao: string;
    };
  };
}

const NovoLote = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [colheitas, setColheitas] = useState<Colheita[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      colheita_id: "",
      tipo: "cereja",
      volume_kg: "",
      humidade_percent: "",
      temperatura_c: "",
    },
  });

  useEffect(() => {
    fetchColheitas();
  }, []);

  const fetchColheitas = async () => {
    try {
      const { data } = await supabase
        .from("colheitas")
        .select(`
          id,
          campanha,
          parcelas (
            codigo_parcela,
            exploracoes (
              designacao
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      setColheitas(data as Colheita[] || []);
    } catch (error) {
      console.error("Error fetching colheitas:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const insertData: any = {
        tipo: values.tipo,
        volume_kg: parseFloat(values.volume_kg),
        humidade_percent: values.humidade_percent ? parseFloat(values.humidade_percent) : null,
        temperatura_c: values.temperatura_c ? parseFloat(values.temperatura_c) : null,
        estado: "pendente",
      };

      if (values.colheita_id && values.colheita_id !== "none") {
        insertData.colheita_id = values.colheita_id;
      }

      const { data, error } = await supabase
        .from("lotes")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      toast.success(`Lote ${data.referencia_lote} criado com sucesso!`);
      navigate("/lotes");
    } catch (error: any) {
      console.error("Error creating lote:", error);
      toast.error(error.message || "Erro ao criar lote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Novo Lote de Café</h1>
            <p className="text-muted-foreground">Registe um novo lote para rastreamento</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Lote</CardTitle>
            <CardDescription>
              QR code e referência serão gerados automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="colheita_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colheita Associada (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione uma colheita" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sem colheita associada</SelectItem>
                          {colheitas.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.campanha} - {c.parcelas?.exploracoes?.designacao || "N/A"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cereja">Cereja</SelectItem>
                            <SelectItem value="cafe_verde">Café Verde</SelectItem>
                            <SelectItem value="parchment">Pergaminho</SelectItem>
                            <SelectItem value="torrado">Torrado</SelectItem>
                            <SelectItem value="moido">Moído</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="volume_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volume (kg) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Ex: 500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="humidade_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Humidade (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Ex: 12.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="temperatura_c"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperatura (°C)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Ex: 25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Lote
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NovoLote;
