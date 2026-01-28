import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Coffee, LogOut, Menu, MapPin, BarChart3, FileText, Settings, Activity, History, Sprout, Leaf, ClipboardCheck } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import QRScanner from "@/components/QRScanner";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut, roles, hasRole } = useAuth();
  const location = useLocation();

  const allNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, roles: ["all"] },
    { name: "Explorações", href: "/exploracoes", icon: MapPin, roles: ["produtor", "cooperativa", "admin_inca", "tecnico_inca"] },
    { name: "Parcelas", href: "/parcelas", icon: MapPin, roles: ["produtor", "cooperativa", "admin_inca", "tecnico_inca"] },
    { name: "Lotes", href: "/lotes", icon: Coffee, roles: ["all"] },
    { name: "Mapa", href: "/mapa", icon: MapPin, roles: ["all"] },
    { name: "Qualidade", href: "/qualidade", icon: FileText, roles: ["tecnico_inca", "admin_inca"] },
    { name: "Validação", href: "/validacao", icon: FileText, roles: ["tecnico_inca", "admin_inca"] },
    { name: "Exportação", href: "/exportacao", icon: FileText, roles: ["exportador", "admin_inca"] },
    { name: "SIM", href: "/sim", icon: BarChart3, roles: ["all"] },
    { name: "Relatórios", href: "/relatorios", icon: FileText, roles: ["all"] },
    { name: "IoT", href: "/iot", icon: Activity, roles: ["tecnico_inca", "admin_inca"] },
    { name: "Colheitas", href: "/colheitas", icon: Sprout, roles: ["produtor", "cooperativa", "admin_inca", "tecnico_inca"] },
    { name: "Manutenção", href: "/manutencao", icon: Leaf, roles: ["produtor", "cooperativa", "admin_inca", "tecnico_inca"] },
    { name: "Fiscalização", href: "/fiscalizacao", icon: ClipboardCheck, roles: ["tecnico_inca", "admin_inca"] },
    { name: "Auditoria", href: "/auditoria", icon: History, roles: ["admin_inca"] },
    { name: "Admin", href: "/admin", icon: Settings, roles: ["admin_inca"] },
  ];

  const navigation = allNavigation.filter((item) => {
    if (item.roles.includes("all")) return true;
    return item.roles.some((role) => hasRole(role));
  });

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-soft">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <Coffee className="h-6 w-6 text-primary" />
                <span className="ml-2 text-lg font-semibold">INCA</span>
              </div>
              <nav className="flex flex-col gap-2 p-4">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold hidden sm:block">
              INCA Coffee Trace
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <QRScanner />
            <NotificationCenter />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">
                    {user?.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Definições
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-card">
          <nav className="flex flex-col gap-2 p-4">
            <NavLinks />
          </nav>

          {roles.length > 0 && (
            <div className="mt-auto p-4 border-t">
              <div className="text-xs text-muted-foreground mb-2">Perfis Activos</div>
              {roles.map((role, index) => (
                <div
                  key={index}
                  className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground mb-1"
                >
                  {role.role.replace("_", " ").toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
