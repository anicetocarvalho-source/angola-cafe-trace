import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Coffee, LogOut, Menu, Map, LayoutDashboard, TrendingUp, FileBarChart, Settings, Activity, History, Sprout, Leaf, ClipboardCheck, FlaskConical, Truck, Handshake, Warehouse, ChevronsLeft, ChevronsRight, Sun, Moon, LucideIcon, Trees, Grid3x3, Ship, Award, ShieldCheck, User } from "lucide-react";
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
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  };

  const handleMobileMenuChange = (open: boolean) => {
    if (open) { setNotificationsOpen(false); setUserMenuOpen(false); }
    setMobileMenuOpen(open);
  };

  const handleNotificationsChange = (open: boolean) => {
    if (open) { setMobileMenuOpen(false); setUserMenuOpen(false); }
    setNotificationsOpen(open);
  };

  const handleUserMenuChange = (open: boolean) => {
    if (open) { setMobileMenuOpen(false); setNotificationsOpen(false); }
    setUserMenuOpen(open);
  };

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
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["all"] },
        { name: "Mapa", href: "/mapa", icon: Map, roles: ["all"] },
        { name: "SIM", href: "/sim", icon: TrendingUp, roles: ["all"] },
        { name: "Relatórios", href: "/relatorios", icon: FileBarChart, roles: ["all"] },
      ],
    },
    {
      label: "Produção",
      items: [
        { name: "Explorações", href: "/exploracoes", icon: Trees, roles: ["produtor", "cooperativa", "tecnico_inca"] },
        { name: "Parcelas", href: "/parcelas", icon: Grid3x3, roles: ["produtor", "cooperativa", "tecnico_inca"] },
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
        { name: "Exportação", href: "/exportacao", icon: Ship, roles: ["exportador"] },
      ],
    },
    {
      label: "Controlo & Qualidade",
      items: [
        { name: "Qualidade", href: "/qualidade", icon: Award, roles: ["tecnico_inca"] },
        { name: "Validação", href: "/validacao", icon: ShieldCheck, roles: ["tecnico_inca"] },
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
      {filteredGroups.map((group, groupIndex) => (
        <div key={group.label} className="mb-1">
          <AnimatePresence mode="wait">
            {(isMobile || !sidebarCollapsed) ? (
              <motion.div
                key="label"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: groupIndex * 0.03 }}
                className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-3 py-1.5 mt-1"
              >
                {group.label}
              </motion.div>
            ) : (
              <motion.div
                key="separator"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border/50 mx-2 my-2"
              />
            )}
          </AnimatePresence>
          {group.items.map((item, itemIndex) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            const link = (
              <Link
                key={item.name}
                to={item.href}
                onClick={isMobile ? handleNavigation : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 relative",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold cursor-default"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !isMobile && sidebarCollapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: sidebarCollapsed && !isMobile ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive && "text-primary")} />
                </motion.div>
                <AnimatePresence>
                  {(isMobile || !sidebarCollapsed) && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, delay: itemIndex * 0.02 }}
                      className="text-sm truncate overflow-hidden whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
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

  const ProfileSection = ({ compact = false }: { compact?: boolean }) => (
    <div className={cn("rounded-lg bg-muted/50 p-2.5", compact && "p-2")}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shrink-0">
          <span className="text-[9px] font-bold text-primary-foreground">{userInitials}</span>
        </div>
        {!compact && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
          </div>
        )}
      </div>
      {roles.length > 0 && !compact && (
        <div className="flex flex-wrap gap-1">
          {roles.map((role, index) => (
            <span
              key={index}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold border border-primary/20"
            >
              {role.role.replace("_", " ").toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-card via-card to-card/95 shadow-sm backdrop-blur-sm">
        <div className="flex h-14 items-center px-4 sm:px-6">
          <Sheet open={mobileMenuOpen} onOpenChange={handleMobileMenuChange}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex h-14 items-center border-b px-5 gap-3 shrink-0">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Coffee className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="text-sm font-bold">INCA Coffee Trace</span>
                    <p className="text-[10px] text-muted-foreground">Sistema de Rastreabilidade</p>
                  </div>
                </div>
                <nav className="flex-1 min-h-0 flex flex-col gap-1 p-3 overflow-y-auto">
                  <NavLinks isMobile />
                </nav>
                <div className="border-t border-border/60 p-3 space-y-2 shrink-0">
                  <ProfileSection />
                  <p className="text-[10px] text-muted-foreground/50 text-center font-medium tracking-wide">INCA v2.0</p>
                </div>
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
            <NotificationCenter open={notificationsOpen} onOpenChange={handleNotificationsChange} />
            <DropdownMenu open={userMenuOpen} onOpenChange={handleUserMenuChange}>
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
        <motion.aside
          animate={{ width: sidebarCollapsed ? 64 : 240 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="hidden lg:flex lg:flex-col border-r bg-card/50 sticky top-14 h-[calc(100vh-3.5rem)] z-40 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-2">
            <nav className="flex flex-col gap-0.5">
              <NavLinks />
            </nav>
          </div>

          {/* Sidebar footer */}
          <div className="border-t border-border/60 p-2 space-y-2">
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && roles.length > 0 ? (
                <motion.div
                  key="profile-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileSection />
                </motion.div>
              ) : sidebarCollapsed ? (
                <motion.div
                  key="profile-compact"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                          <span className="text-[9px] font-bold text-primary-foreground">{userInitials}</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {roles.map(r => r.role.replace("_", " ").toUpperCase()).join(", ") || user?.email}
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  <motion.div
                    animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </motion.div>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <>
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs font-medium flex-1 text-left overflow-hidden whitespace-nowrap"
                        >
                          Recolher
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-[10px] text-muted-foreground/50"
                        >
                          v2.0
                        </motion.span>
                      </>
                    )}
                  </AnimatePresence>
                </button>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">Expandir menu</TooltipContent>
              )}
            </Tooltip>
          </div>
        </motion.aside>

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
