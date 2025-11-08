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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  exploracao_id: z.string().min(1, "Seleccione uma exploração"),
  codigo_parcela: z.string().min(1, "Código obrigatório"),
  area_ha: z.string().min(1, "Área obrigatória"),
  ano_plantio: z.string().optional(),
  irrigacao: z.boolean().default(false),
  sombra_percent: z.string().optional(),
});

const NovaParcela = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exploracoes, setExploracoes] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exploracao_id: "",
      codigo_parcela: "",
      area_ha: "",
      ano_plantio: "",
      irrigacao: false,
      sombra_percent: "",
    },
  });

  useEffect(() => {
    fetchExploracoes();
  }, []);

  const fetchExploracoes = async () => {
    try {
      const { data } = await supabase
        .from("exploracoes")
        .select("id, designacao, provincia")
        .eq("status", "validado")
        .order("designacao", { ascending: true });

      setExploracoes(data || []);
    } catch (error) {
      console.error("Error fetching exploracoes:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      const { error } = await supabase.from("parcelas").insert({
        exploracao_id: values.exploracao_id,
        codigo_parcela: values.codigo_parcela,
        area_ha: parseFloat(values.area_ha),
        ano_plantio: values.ano_plantio ? parseInt(values.ano_plantio) : null,
        irrigacao: values.irrigacao,
        sombra_percent: values.sombra_percent ? parseInt(values.sombra_percent) : null,
      });

      if (error) throw error;

      toast.success("Parcela registada com sucesso!");
      navigate("/parcelas");
    } catch (error: any) {
      console.error("Error creating parcela:", error);
      toast.error(error.message || "Erro ao registar parcela");
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
            <h1 className="text-3xl font-bold text-foreground">Nova Parcela</h1>
            <p className="text-muted-foreground">Registar nova parcela agrícola</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Parcela</CardTitle>
            <CardDescription>
              Parcelas são subdivisões dentro de explorações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="exploracao_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exploração *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione a exploração" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {exploracoes.map((exp) => (
                            <SelectItem key={exp.id} value={exp.id}>
                              {exp.designacao} ({exp.provincia})
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
                    name="codigo_parcela"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código da Parcela *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: P-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area_ha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área (hectares) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Ex: 5.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ano_plantio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano de Plantio</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sombra_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sombra (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" placeholder="Ex: 30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="irrigacao"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Possui irrigação
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registar Parcela
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

export default NovaParcela;
