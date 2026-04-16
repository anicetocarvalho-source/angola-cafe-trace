import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ children, requiredRole, requiredRoles }: ProtectedRouteProps) => {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Admins have access to everything
  if (hasRole("admin_inca")) {
    return <>{children}</>;
  }

  // Check specific role(s)
  const hasRequiredAccess = requiredRoles
    ? requiredRoles.some((r) => hasRole(r))
    : requiredRole
      ? hasRole(requiredRole)
      : true;

  if (!hasRequiredAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Acesso Negado
          </h2>
          <p className="text-muted-foreground mb-6">
            Não tem permissões para aceder a esta página.
          </p>
          <Button variant="default" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
