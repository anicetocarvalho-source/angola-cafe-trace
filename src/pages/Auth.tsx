import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Coffee, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const QUICK_USERS = [
  { label: "Admin", email: "anicetojjc@gmail.com" },
  { label: "Técnico", email: "tecnico@teste.ao" },
  { label: "Produtor", email: "produtor@teste.ao" },
  { label: "Cooperativa", email: "cooperativa@teste.ao" },
  { label: "Processador", email: "processador@teste.ao" },
  { label: "Transportador", email: "transportador@teste.ao" },
  { label: "Exportador", email: "exportador@teste.ao" },
  { label: "Comprador", email: "comprador@teste.ao" },
];

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ ultimo_login_at: new Date().toISOString() })
          .eq("id", data.user.id);
      }
      toast.success("Login efectuado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!nome.trim()) {
      toast.error("Por favor, insira o seu nome");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error("A password deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      if (data.user) toast.success("Conta criada com sucesso! A redirecionar...");
    } catch (error: any) {
      if (error.message?.includes("already registered")) {
        toast.error("Este email já está registado");
      } else {
        toast.error(error.message || "Erro ao criar conta");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, label: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: "Teste123!",
      });
      if (error) throw error;
      if (data.user) {
        await supabase
          .from("profiles")
          .update({ ultimo_login_at: new Date().toISOString() })
          .eq("id", data.user.id);
      }
      toast.success(`Login como ${label} efectuado com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[hsl(var(--auth-foreground))] placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--copper))]/60 focus:border-[hsl(var(--copper))]/50 transition-all font-manrope text-sm";

  const labelClass =
    "block text-[10px] font-semibold text-[hsl(var(--auth-muted))] uppercase tracking-[0.18em] mb-2 ml-1 font-manrope";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[hsl(var(--auth-bg))] bg-gradient-auth p-6 font-manrope text-[hsl(var(--auth-foreground))]">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-copper shadow-xl shadow-black/40">
            <Coffee className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-sora font-semibold tracking-tight text-white mb-1">
            INCA Coffee Trace
          </h1>
          <p className="text-[hsl(var(--auth-muted))] text-sm font-light tracking-wide">
            Sistema de Rastreabilidade do Café
          </p>
        </div>

        {/* Glass card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <div className="mb-8">
            <h2 className="text-xl font-sora font-medium text-white mb-1">Bem-vindo</h2>
            <p className="text-[hsl(var(--auth-muted))] text-sm">
              {tab === "login"
                ? "Inicie sessão para aceder ao sistema"
                : "Crie uma conta para aceder ao sistema"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-black/30 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === "login"
                  ? "bg-[hsl(var(--copper))] text-[hsl(var(--copper-foreground))] shadow-sm"
                  : "text-[hsl(var(--auth-muted))] hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === "signup"
                  ? "bg-[hsl(var(--copper))] text-[hsl(var(--copper-foreground))] shadow-sm"
                  : "text-[hsl(var(--auth-muted))] hover:text-white"
              }`}
            >
              Registar
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="login-email" className={labelClass}>Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.ao"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="login-password" className={labelClass}>Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[hsl(var(--copper))] hover:bg-[hsl(var(--copper-hover))] text-[hsl(var(--copper-foreground))] font-semibold rounded-xl transition-all shadow-lg shadow-black/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 font-manrope"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Entrar
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label htmlFor="signup-name" className={labelClass}>Nome completo</label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="João Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="signup-email" className={labelClass}>Email</label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="seu@email.ao"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="signup-password" className={labelClass}>Password</label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={inputClass}
                />
                <p className="text-[11px] text-[hsl(var(--auth-muted))] mt-1.5 ml-1">
                  Mínimo de 6 caracteres
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[hsl(var(--copper))] hover:bg-[hsl(var(--copper-hover))] text-[hsl(var(--copper-foreground))] font-semibold rounded-xl transition-all shadow-lg shadow-black/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 font-manrope"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Criar Conta
              </button>
            </form>
          )}

          {tab === "login" && (
            <>
              {/* Divider */}
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[hsl(var(--auth-bg-glow))] px-3 text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--auth-muted))]">
                    Login Rápido (Testes)
                  </span>
                </div>
              </div>

              {/* Quick role login */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {QUICK_USERS.map((user) => (
                  <button
                    key={user.email}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(user.email, user.label)}
                    className="px-3 py-2.5 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-[hsl(var(--auth-foreground))] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-manrope"
                  >
                    {user.label}
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-center text-[hsl(var(--auth-muted))] mb-2">
                Password padrão:{" "}
                <code className="text-[hsl(var(--copper-hover))] bg-[hsl(var(--copper))]/10 px-1.5 py-0.5 rounded font-mono">
                  Teste123!
                </code>
              </p>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm text-[hsl(var(--auth-muted))] hover:text-white transition-colors group font-manrope"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Voltar à página inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
