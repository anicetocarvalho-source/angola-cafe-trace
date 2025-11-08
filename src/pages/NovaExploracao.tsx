import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const provincias = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte",
  "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Luanda", "Lunda Norte",
  "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"
];

const formSchema = z.object({
  designacao: z.string().min(3, "Mínimo 3 caracteres"),
  area_ha: z.string().min(1, "Área obrigatória"),
  provincia: z.string().min(1, "Província obrigatória"),
  municipio: z.string().min(2, "Município obrigatório"),
  comuna: z.string().optional(),
  aldeia: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  altitude_m: z.string().optional(),
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
      provincia: "",
      municipio: "",
      comuna: "",
      aldeia: "",
      latitude: "",
      longitude: "",
      altitude_m: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setLoading(true);

    try {
      // Get user's entity
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
        aldeia: values.aldeia || null,
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
    <DashboardLayout>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="provincia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Província *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione província" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provincias.map((p) => (
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
                        <FormControl>
                          <Input placeholder="Ex: Caála" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="comuna"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comuna</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Catata" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aldeia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aldeia</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da aldeia" {...field} />
                        </FormControl>
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
    </DashboardLayout>
  );
};

export default NovaExploracao;
