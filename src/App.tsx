import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verificar" element={<Verificar />} />
          <Route path="/verificar/:referencia" element={<Verificar />} />
          <Route path="/sim-publico" element={<SIMPublico />} />
          <Route path="/boletim-mercado" element={<BoletimMercado />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mapa"
            element={
              <ProtectedRoute>
                <Mapa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lotes"
            element={
              <ProtectedRoute>
                <Lotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lotes/novo"
            element={
              <ProtectedRoute>
                <NovoLote />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exploracoes"
            element={
              <ProtectedRoute>
                <Exploracoes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exploracoes/nova"
            element={
              <ProtectedRoute>
                <NovaExploracao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/secagem/nova"
            element={
              <ProtectedRoute>
                <NovaSecagem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nova-analise"
            element={
              <ProtectedRoute>
                <NovaAnalise />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validacao"
            element={
              <ProtectedRoute requiredRole="tecnico_inca">
                <Validacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/qualidade"
            element={
            <ProtectedRoute requiredRole="tecnico_inca">
                <Qualidade />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin_inca">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sim"
            element={
              <ProtectedRoute>
                <SIM />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exportacao"
            element={
            <ProtectedRoute requiredRole="exportador">
                <Exportacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nova-exportacao"
            element={
              <ProtectedRoute>
                <NovaExportacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parcelas"
            element={
              <ProtectedRoute>
                <Parcelas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parcelas/nova"
            element={
              <ProtectedRoute>
                <NovaParcela />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lotes/:id"
            element={
              <ProtectedRoute>
                <LoteDetalhes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/iot"
            element={
            <ProtectedRoute requiredRole="tecnico_inca">
                <IoT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/colheitas"
            element={
              <ProtectedRoute>
                <Colheitas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/colheitas/nova"
            element={
              <ProtectedRoute>
                <NovaColheita />
              </ProtectedRoute>
            }
          />
          <Route
            path="/colheitas/:id/editar"
            element={
              <ProtectedRoute>
                <NovaColheita />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auditoria"
            element={
              <ProtectedRoute requiredRole="admin_inca">
                <Auditoria />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exportacao/:id"
            element={
              <ProtectedRoute>
                <ExportacaoDetalhes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manutencao"
            element={
              <ProtectedRoute>
                <ManutencaoAgricola />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manutencao/nova"
            element={
              <ProtectedRoute>
                <NovaManutencao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manutencao/:id/editar"
            element={
              <ProtectedRoute>
                <NovaManutencao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fiscalizacao"
            element={
              <ProtectedRoute requiredRole="tecnico_inca">
                <Fiscalizacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fiscalizacao/nova"
            element={
              <ProtectedRoute requiredRole="tecnico_inca">
                <NovaVisita />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fiscalizacao/:id"
            element={
              <ProtectedRoute requiredRole="tecnico_inca">
                <VisitaDetalhes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transformacao"
            element={
            <ProtectedRoute requiredRole="processador">
                <Transformacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logistica"
            element={
            <ProtectedRoute requiredRole="transportador">
                <Logistica />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comercializacao"
            element={
            <ProtectedRoute requiredRole="exportador">
                <Comercializacao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/armazenamento"
            element={
            <ProtectedRoute requiredRole="processador">
                <Armazenamento />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checklists"
            element={
              <ProtectedRoute requiredRole="tecnico_inca">
                <Checklists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/torra"
            element={
              <ProtectedRoute requiredRole="processador">
                <Torra />
              </ProtectedRoute>
            }
          />
          <Route
            path="/embalagem"
            element={
              <ProtectedRoute requiredRole="processador">
                <Embalagem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
