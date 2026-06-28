import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { PROVINCIAS_ANGOLA } from "@/lib/provincias";
import { isMunicipioValido, isComunaValida } from "@/lib/dpa-angola";
import LocalizacaoSelect from "@/components/forms/LocalizacaoSelect";


const formSchema = z
  .object({
    designacao: z.string().min(3, "Mínimo 3 caracteres"),
    area_ha: z.string().min(1, "Área obrigatória"),
    provincia: z.enum(PROVINCIAS_ANGOLA, {
      errorMap: () => ({ message: "Província inválida. Seleccione uma das 21 províncias de Angola." }),
    }),
    municipio: z.string().min(1, "Município obrigatório"),
    comuna: z.string().optional().or(z.literal("")),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    altitude_m: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!isMunicipioValido(data.provincia, data.municipio)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["municipio"],
        message: "Município não pertence à província seleccionada.",
      });
    }
    if (data.comuna && !isComunaValida(data.provincia, data.municipio, data.comuna)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["comuna"],
        message: "Comuna não pertence ao município seleccionado.",
      });
    }
  });

const NovaExploracao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designacao: "",
      area_ha: "",
      provincia: undefined,
      municipio: "",
      comuna: "",
      latitude: "",
      longitude: "",
      altitude_m: "",
    },
  });

  const provincia = form.watch("provincia");
  const municipio = form.watch("municipio");

  const municipiosDisponiveis = useMemo(
    () => (provincia ? getMunicipios(provincia as ProvinciaAngola) : []),
    [provincia],
  );
  const comunasDisponiveis = useMemo(
    () => (provincia && municipio ? getComunas(provincia as ProvinciaAngola, municipio) : []),
    [provincia, municipio],
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("entidade_id")
        .eq("id", user.id)
        .single();

      if (!profile?.entidade_id) {
        toast.error("Perfil não está associado a uma entidade. Contacte o administrador.");
        return;
      }

      const { error } = await supabase.from("exploracoes").insert({
        produtor_id: profile.entidade_id,
        designacao: values.designacao,
        area_ha: parseFloat(values.area_ha),
        provincia: values.provincia,
        municipio: values.municipio,
        comuna: values.comuna || null,
        latitude: values.latitude ? parseFloat(values.latitude) : null,
        longitude: values.longitude ? parseFloat(values.longitude) : null,
        altitude_m: values.altitude_m ? parseInt(values.altitude_m) : null,
        status: "pendente",
      });

      if (error) throw error;

      toast.success("Exploração registada com sucesso! Aguarda validação.");
      navigate("/exploracoes");
    } catch (error: any) {
      console.error("Error creating exploration:", error);
      toast.error(error.message || "Erro ao registar exploração");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nova Exploração Agrícola</h1>
            <p className="text-muted-foreground">Registe uma nova exploração de café</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Exploração</CardTitle>
            <CardDescription>
              Preencha os dados da exploração. Após submissão, aguardará validação do INCA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="designacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Exploração *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Fazenda São José" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="area_ha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área (hectares) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="Ex: 25.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="altitude_m"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altitude (metros)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Ex: 1200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="provincia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Província *</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            form.setValue("municipio", "", { shouldValidate: false });
                            form.setValue("comuna", "", { shouldValidate: false });
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione província" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROVINCIAS_ANGOLA.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
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
                    name="municipio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Município *</FormLabel>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            form.setValue("comuna", "", { shouldValidate: false });
                          }}
                          value={field.value || ""}
                          disabled={!provincia}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={provincia ? "Seleccione município" : "Escolha província primeiro"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {municipiosDisponiveis.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
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
                    name="comuna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comuna</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={!municipio || comunasDisponiveis.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !municipio
                                  ? "Escolha município primeiro"
                                  : comunasDisponiveis.length === 0
                                    ? "Sem comunas registadas"
                                    : "Seleccione comuna"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {comunasDisponiveis.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Coordenadas GPS (opcional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Para localização exacta no mapa. Formato decimal (ex: -12.345678)
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.000001" placeholder="-12.345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.000001" placeholder="15.123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registar Exploração
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
    </>
  );
};

export default NovaExploracao;
