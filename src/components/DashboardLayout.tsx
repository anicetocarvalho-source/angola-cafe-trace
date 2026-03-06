import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Coffee, LogOut, Menu, MapPin, BarChart3, FileText, Settings, Activity, History, Sprout, Leaf, ClipboardCheck, FlaskConical, Truck, Handshake, Warehouse, ChevronsLeft, ChevronsRight, Sun, Moon, LucideIcon } from "lucide-react";
import { useTheme } from "next-themes";
import NotificationCenter from "@/components/NotificationCenter";
import QRScanner from "@/components/QRScanner";
import PageTransition from "@/components/PageTransition";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut, roles, hasRole, loading } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
    roles: string[];
  }

  interface NavGroup {
    label: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      label: "Geral",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: BarChart3, roles: ["all"] },
        { name: "Mapa", href: "/mapa", icon: MapPin, roles: ["all"] },
        { name: "SIM", href: "/sim", icon: BarChart3, roles: ["all"] },
        { name: "Relatórios", href: "/relatorios", icon: FileText, roles: ["all"] },
      ],
    },
    {
      label: "Produção",
      items: [
        { name: "Explorações", href: "/exploracoes", icon: MapPin, roles: ["produtor", "cooperativa", "tecnico_inca"] },
        { name: "Parcelas", href: "/parcelas", icon: MapPin, roles: ["produtor", "cooperativa", "tecnico_inca"] },
        { name: "Colheitas", href: "/colheitas", icon: Sprout, roles: ["produtor", "cooperativa", "tecnico_inca"] },
        { name: "Manutenção", href: "/manutencao", icon: Leaf, roles: ["produtor", "cooperativa", "tecnico_inca"] },
      ],
    },
    {
      label: "Processamento",
      items: [
        { name: "Lotes", href: "/lotes", icon: Coffee, roles: ["all"] },
        { name: "Transformação", href: "/transformacao", icon: FlaskConical, roles: ["processador", "cooperativa", "tecnico_inca"] },
        { name: "Armazenamento", href: "/armazenamento", icon: Warehouse, roles: ["processador", "cooperativa", "exportador", "tecnico_inca"] },
      ],
    },
    {
      label: "Cadeia de Valor",
      items: [
        { name: "Logística", href: "/logistica", icon: Truck, roles: ["transportador", "tecnico_inca"] },
        { name: "Comercialização", href: "/comercializacao", icon: Handshake, roles: ["exportador", "comprador", "tecnico_inca"] },
        { name: "Exportação", href: "/exportacao", icon: FileText, roles: ["exportador"] },
      ],
    },
    {
      label: "Controlo & Qualidade",
      items: [
        { name: "Qualidade", href: "/qualidade", icon: FileText, roles: ["tecnico_inca"] },
        { name: "Validação", href: "/validacao", icon: FileText, roles: ["tecnico_inca"] },
        { name: "Fiscalização", href: "/fiscalizacao", icon: ClipboardCheck, roles: ["tecnico_inca"] },
        { name: "IoT", href: "/iot", icon: Activity, roles: ["tecnico_inca"] },
      ],
    },
    {
      label: "Administração",
      items: [
        { name: "Auditoria", href: "/auditoria", icon: History, roles: ["admin_inca"] },
        { name: "Admin", href: "/admin", icon: Settings, roles: ["admin_inca"] },
      ],
    },
  ];

  const isAdmin = hasRole("admin_inca");

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.roles.includes("all")) return true;
        if (loading) return false;
        if (isAdmin) return true;
        return item.roles.some((role) => hasRole(role));
      }),
    }))
    .filter((group) => group.items.length > 0);

  const handleNavigation = () => {
    setMobileMenuOpen(false);
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "?";

  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {filteredGroups.map((group) => (
        <div key={group.label} className="mb-2">
          {(isMobile || !sidebarCollapsed) && (
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-3 py-1.5 mt-1">
              {group.label}
            </div>
          )}
          {sidebarCollapsed && !isMobile && (
            <div className="border-t border-border/40 mx-2 my-1" />
          )}
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            const link = (
              <Link
                key={item.name}
                to={item.href}
                onClick={isMobile ? handleNavigation : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 relative group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !isMobile && sidebarCollapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                )}
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow-sm")} />
                {(isMobile || !sidebarCollapsed) && (
                  <span className="text-sm font-medium truncate">{item.name}</span>
                )}
              </Link>
            );

            if (!isMobile && sidebarCollapsed) {
              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.name}>{link}</div>;
          })}
        </div>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-card via-card to-card/95 shadow-sm backdrop-blur-sm">
        <div className="flex h-14 items-center px-4 sm:px-6">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="flex h-14 items-center border-b px-5 gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Coffee className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-sm font-bold">INCA Coffee Trace</span>
                  <p className="text-[10px] text-muted-foreground">Sistema de Rastreabilidade</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1 p-3 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <NavLinks isMobile />
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-card/50">
                <p className="text-[10px] text-muted-foreground text-center">INCA v2.0 • Coffee Trace</p>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Coffee className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-foreground">INCA Coffee Trace</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 transition-colors"
              aria-label="Alternar tema"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <QRScanner />
            <NotificationCenter />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-primary-foreground">
                      {userInitials}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm max-w-[160px] truncate">
                    {user?.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/perfil">
                    <Settings className="mr-2 h-4 w-4" />
                    Definições
                  </Link>
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
        <aside
          className={cn(
            "hidden lg:flex lg:flex-col border-r bg-card/50 transition-all duration-300 sticky top-14 h-[calc(100vh-3.5rem)] z-40",
            sidebarCollapsed ? "lg:w-16" : "lg:w-60"
          )}
        >
          <div className="flex-1 overflow-y-auto p-2">
            <nav className="flex flex-col gap-1">
              <NavLinks />
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="border-t p-2">
            {!sidebarCollapsed && roles.length > 0 && (
              <div className="mb-2 px-2">
                <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Perfis</div>
                <div className="flex flex-wrap gap-1">
                  {roles.map((role, index) => (
                    <span
                      key={index}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/80 text-secondary-foreground font-medium"
                    >
                      {role.role.replace("_", " ").toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn("w-full", sidebarCollapsed && "px-0 justify-center")}
            >
              {sidebarCollapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronsLeft className="h-4 w-4 mr-2" />
                  <span className="text-xs">Recolher</span>
                </>
              )}
            </Button>
            {!sidebarCollapsed && (
              <p className="text-[10px] text-muted-foreground text-center mt-1">v2.0</p>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
