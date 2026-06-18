import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "./components/AppLayout";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Mapa from "./pages/Mapa";
import Lotes from "./pages/Lotes";
import NovoLote from "./pages/NovoLote";
import Exploracoes from "./pages/Exploracoes";
import NovaExploracao from "./pages/NovaExploracao";
import NovaSecagem from "./pages/NovaSecagem";
import NovaAnalise from "./pages/NovaAnalise";
import Validacao from "./pages/Validacao";
import Qualidade from "./pages/Qualidade";
import Admin from "./pages/Admin";
import SIM from "./pages/SIM";
import Exportacao from "./pages/Exportacao";
import NovaExportacao from "./pages/NovaExportacao";
import Relatorios from "./pages/Relatorios";
import Verificar from "./pages/Verificar";
import NotFound from "./pages/NotFound";
import Parcelas from "./pages/Parcelas";
import LoteDetalhes from "./pages/LoteDetalhes";
import NovaParcela from "./pages/NovaParcela";
import IoT from "./pages/IoT";
import Colheitas from "./pages/Colheitas";
import NovaColheita from "./pages/NovaColheita";
import Auditoria from "./pages/Auditoria";
import ExportacaoDetalhes from "./pages/ExportacaoDetalhes";
import ManutencaoAgricola from "./pages/ManutencaoAgricola";
import NovaManutencao from "./pages/NovaManutencao";
import Fiscalizacao from "./pages/Fiscalizacao";
import NovaVisita from "./pages/NovaVisita";
import VisitaDetalhes from "./pages/VisitaDetalhes";
import Transformacao from "./pages/Transformacao";
import Logistica from "./pages/Logistica";
import Comercializacao from "./pages/Comercializacao";
import Armazenamento from "./pages/Armazenamento";
import SIMPublico from "./pages/SIMPublico";
import BoletimMercado from "./pages/BoletimMercado";
import Perfil from "./pages/Perfil";
import Checklists from "./pages/Checklists";
import Torra from "./pages/Torra";
import Embalagem from "./pages/Embalagem";
import LoteOperacoes from "./pages/LoteOperacoes";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verificar" element={<Verificar />} />
              <Route path="/verificar/:referencia" element={<Verificar />} />
              <Route path="/sim-publico" element={<SIMPublico />} />
              <Route path="/boletim-mercado" element={<BoletimMercado />} />

              {/* Authenticated routes (persistent layout) */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mapa" element={<Mapa />} />
                <Route path="/lotes" element={<Lotes />} />
                <Route path="/lotes/novo" element={<NovoLote />} />
                <Route path="/lotes/operacoes" element={<LoteOperacoes />} />
                <Route path="/lotes/:id" element={<LoteDetalhes />} />
                <Route path="/exploracoes" element={<Exploracoes />} />
                <Route path="/exploracoes/nova" element={<NovaExploracao />} />
                <Route path="/secagem/nova" element={<NovaSecagem />} />
                <Route path="/nova-analise" element={<NovaAnalise />} />
                <Route path="/sim" element={<SIM />} />
                <Route path="/nova-exportacao" element={<NovaExportacao />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/parcelas" element={<Parcelas />} />
                <Route path="/parcelas/nova" element={<NovaParcela />} />
                <Route path="/colheitas" element={<Colheitas />} />
                <Route path="/colheitas/nova" element={<NovaColheita />} />
                <Route path="/colheitas/:id/editar" element={<NovaColheita />} />
                <Route path="/exportacao/:id" element={<ExportacaoDetalhes />} />
                <Route path="/manutencao" element={<ManutencaoAgricola />} />
                <Route path="/manutencao/nova" element={<NovaManutencao />} />
                <Route path="/manutencao/:id/editar" element={<NovaManutencao />} />
                
                <Route path="/perfil" element={<Perfil />} />
              </Route>

              {/* tecnico_inca-restricted */}
              <Route element={<AppLayout requiredRole="tecnico_inca" />}>
                <Route path="/validacao" element={<Validacao />} />
                <Route path="/qualidade" element={<Qualidade />} />
                <Route path="/iot" element={<IoT />} />
                <Route path="/fiscalizacao" element={<Fiscalizacao />} />
                <Route path="/fiscalizacao/nova" element={<NovaVisita />} />
                <Route path="/fiscalizacao/:id" element={<VisitaDetalhes />} />
                <Route path="/checklists" element={<Checklists />} />
              </Route>

              {/* admin_inca-restricted */}
              <Route element={<AppLayout requiredRole="admin_inca" />}>
                <Route path="/admin" element={<Admin />} />
                <Route path="/auditoria" element={<Auditoria />} />
              </Route>

              {/* exportador-restricted */}
              <Route element={<AppLayout requiredRole="exportador" />}>
                <Route path="/exportacao" element={<Exportacao />} />
              </Route>

              {/* processador-restricted */}
              <Route element={<AppLayout requiredRole="processador" />}>
                <Route path="/transformacao" element={<Transformacao />} />
                <Route path="/armazenamento" element={<Armazenamento />} />
                <Route path="/torra" element={<Torra />} />
                <Route path="/embalagem" element={<Embalagem />} />
              </Route>

              {/* transportador-restricted */}
              <Route element={<AppLayout requiredRole="transportador" />}>
                <Route path="/logistica" element={<Logistica />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BackToTop />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
