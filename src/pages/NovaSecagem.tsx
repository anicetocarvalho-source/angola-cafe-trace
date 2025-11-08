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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  lote_id: z.string().min(1, "Seleccione um lote"),
  metodo: z.string().min(1, "Método obrigatório"),
  data_inicio: z.date({ required_error: "Data de início obrigatória" }),
  data_fim: z.date().optional(),
  tempo_total_h: z.string().optional(),
  temp_media_c: z.string().optional(),
  humidade_final_percent: z.string().optional(),
  notas: z.string().optional(),
});

const NovaSecagem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lotes, setLotes] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lote_id: "",
      metodo: "terreiro",
      notas: "",
    },
  });

  useEffect(() => {
    fetchLotes();
  }, []);

  const fetchLotes = async () => {
    try {
      const { data } = await supabase
        .from("lotes")
        .select("id, referencia_lote, tipo, volume_kg")
        .in("estado", ["pendente", "em_processo"])
        .order("created_at", { ascending: false });

      setLotes(data || []);
    } catch (error) {
      console.error("Error fetching lotes:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const insertData: any = {
        lote_id: values.lote_id,
        metodo: values.metodo,
        data_inicio: values.data_inicio.toISOString().split("T")[0],
        data_fim: values.data_fim ? values.data_fim.toISOString().split("T")[0] : null,
        tempo_total_h: values.tempo_total_h ? parseInt(values.tempo_total_h) : null,
        temp_media_c: values.temp_media_c ? parseFloat(values.temp_media_c) : null,
        humidade_final_percent: values.humidade_final_percent
          ? parseFloat(values.humidade_final_percent)
          : null,
        notas: values.notas || null,
      };

      const { error } = await supabase.from("secagens").insert(insertData);

      if (error) throw error;

      // Update lote humidity if provided
      if (values.humidade_final_percent) {
        await supabase
          .from("lotes")
          .update({
            humidade_percent: parseFloat(values.humidade_final_percent),
            estado: "em_processo",
          } as any)
          .eq("id", values.lote_id);
      }

      toast.success("Processo de secagem registado com sucesso!");
      navigate("/lotes");
    } catch (error: any) {
      console.error("Error creating secagem:", error);
      toast.error(error.message || "Erro ao registar secagem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Registar Secagem</h1>
            <p className="text-muted-foreground">
              Documente o processo de secagem do café
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Secagem</CardTitle>
            <CardDescription>
              Registe temperatura, humidade e tempo de secagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="lote_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lote *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione o lote" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lotes.map((lote) => (
                            <SelectItem key={lote.id} value={lote.id}>
                              {lote.referencia_lote} - {lote.tipo} ({lote.volume_kg} kg)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metodo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Secagem *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="terreiro">Terreiro (Natural)</SelectItem>
                          <SelectItem value="estufa">Estufa</SelectItem>
                          <SelectItem value="mecanica">Secagem Mecânica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Método utilizado para secar o café
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="data_inicio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Início *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Seleccionar data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="data_fim"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Fim</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Seleccionar data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="tempo_total_h"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo Total (horas)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 240" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="temp_media_c"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temp. Média (°C)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Ex: 28.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="humidade_final_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Humidade Final (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Ex: 12.0" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Ideal: 10-12%
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Condições climáticas, uniformidade, problemas encontrados..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registar Secagem
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

export default NovaSecagem;
