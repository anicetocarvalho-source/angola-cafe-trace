import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Phone, Mail, Shield, Calendar, Loader2, Save } from "lucide-react";
import { z } from "zod";

const profileSchema = z.object({
  nome: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres").max(100, "O nome deve ter menos de 100 caracteres"),
  telemovel: z.string().trim().max(20, "O telemóvel deve ter menos de 20 caracteres").regex(/^(\+?\d[\d\s-]*)?$/, "Formato de telemóvel inválido").optional().or(z.literal("")),
});

const Perfil = () => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const [nome, setNome] = useState("");
  const [telemovel, setTelemovel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profile) {
      setNome(profile.nome || "");
      setTelemovel(profile.telemovel || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (values: { nome: string; telemovel: string | null }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: values.nome,
          telemovel: values.telemovel,
        })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Perfil actualizado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao actualizar perfil");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = profileSchema.safeParse({ nome, telemovel });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    updateMutation.mutate({
      nome: result.data.nome,
      telemovel: result.data.telemovel || null,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Breadcrumbs />

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerir os seus dados pessoais</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>Actualize os seus dados de contacto</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="O seu nome completo"
                      maxLength={100}
                    />
                    {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telemovel">Telemóvel</Label>
                    <Input
                      id="telemovel"
                      value={telemovel}
                      onChange={(e) => setTelemovel(e.target.value)}
                      placeholder="+244 9XX XXX XXX"
                      maxLength={20}
                    />
                    {errors.telemovel && <p className="text-sm text-destructive">{errors.telemovel}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                  </div>

                  <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto">
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Guardar Alterações
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Account Info Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Perfis Atribuídos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {roles.map((r, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {r.role.replace("_", " ").toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum perfil atribuído</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Informação da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Conta criada
                  </p>
                  <p className="text-sm font-medium">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString("pt-AO")
                      : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Perfil;
