import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Shield } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserWithRoles {
  id: string;
  email: string;
  profiles: {
    nome: string;
  }[];
  user_roles: {
    role: string;
  }[];
}

const roles = [
  { value: "admin_inca", label: "Admin INCA" },
  { value: "tecnico_inca", label: "Técnico INCA" },
  { value: "produtor", label: "Produtor" },
  { value: "cooperativa", label: "Cooperativa" },
  { value: "processador", label: "Processador" },
  { value: "transportador", label: "Transportador" },
  { value: "exportador", label: "Exportador" },
  { value: "comprador", label: "Comprador" },
];

const Admin = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasRole("admin_inca")) {
      fetchUsers();
    }
  }, [hasRole]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          nome,
          user_roles (
            role
          )
        `)
        .order("nome");

      if (error) throw error;

      // Get emails from auth.users
      const userIds = data?.map((u) => u.id) || [];
      const usersWithEmails = await Promise.all(
        data?.map(async (profile) => {
          // For now, we'll use the profile data as is since we can't query auth.users directly
          return {
            id: profile.id,
            email: "user@example.com", // Placeholder
            profiles: [{ nome: profile.nome }],
            user_roles: profile.user_roles || [],
          };
        }) || []
      );

      setUsers(usersWithEmails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) {
        if (error.code === "23505") {
          toast.error("Utilizador já tem este perfil");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Perfil atribuído com sucesso");
      fetchUsers();
    } catch (error: any) {
      console.error("Error adding role:", error);
      toast.error(error.message || "Erro ao atribuir perfil");
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast.success("Perfil removido com sucesso");
      fetchUsers();
    } catch (error: any) {
      console.error("Error removing role:", error);
      toast.error(error.message || "Erro ao remover perfil");
    }
  };

  if (!hasRole("admin_inca")) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Esta área é restrita a administradores INCA.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administração</h1>
          <p className="text-muted-foreground">Gestão de utilizadores e permissões</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Utilizadores do Sistema</CardTitle>
            </div>
            <CardDescription>
              Gerir perfis e permissões dos utilizadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">A carregar...</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Perfis Actuais</TableHead>
                      <TableHead>Atribuir Perfil</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.profiles[0]?.nome || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {user.user_roles.length === 0 ? (
                              <span className="text-sm text-muted-foreground">
                                Sem perfis atribuídos
                              </span>
                            ) : (
                              user.user_roles.map((ur, idx) => (
                                <Badge key={idx} variant="outline" className="gap-2">
                                  {roles.find((r) => r.value === ur.role)?.label || ur.role}
                                  <button
                                    onClick={() => handleRemoveRole(user.id, ur.role)}
                                    className="text-xs hover:text-destructive"
                                  >
                                    ✕
                                  </button>
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) => handleAddRole(user.id, value)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Adicionar perfil" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
