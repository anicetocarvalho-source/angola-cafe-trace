import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import Validacao from "./pages/Validacao";
import Admin from "./pages/Admin";
import SIM from "./pages/SIM";
import Exportacao from "./pages/Exportacao";
import Relatorios from "./pages/Relatorios";
import Verificar from "./pages/Verificar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
            path="/validacao"
            element={
              <ProtectedRoute requiredRole="tecnico_inca">
                <Validacao />
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
              <ProtectedRoute>
                <Exportacao />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
