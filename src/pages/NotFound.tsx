import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Package, QrCode, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const quickLinks = [
  {
    to: "/dashboard",
    label: "Dashboard",
    description: "Aceder ao painel principal",
    icon: LayoutDashboard,
  },
  {
    to: "/lotes",
    label: "Lotes",
    description: "Gerir os lotes de café",
    icon: Package,
  },
  {
    to: "/verificar",
    label: "Verificar",
    description: "Portal público de verificação",
    icon: QrCode,
  },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8">
          <h1 className="mb-2 text-7xl font-bold text-primary md:text-8xl">404</h1>
          <h2 className="mb-3 text-2xl font-semibold text-foreground md:text-3xl">
            Página não encontrada
          </h2>
          <p className="mx-auto max-w-md text-muted-foreground">
            A página que procura não existe ou foi movida. Use uma das sugestões abaixo para
            continuar a navegar.
          </p>
          <p className="mt-2 break-all font-mono text-xs text-muted-foreground/70">
            {location.pathname}
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {quickLinks.map(({ to, label, description, icon: Icon }) => (
            <Link key={to} to={to} className="group">
              <Card className="h-full transition-all hover:border-primary hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
                  <div className="rounded-full bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Voltar à página anterior
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Página inicial
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
