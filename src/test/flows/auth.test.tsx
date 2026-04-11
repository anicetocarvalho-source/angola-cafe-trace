import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Auth from "@/pages/Auth";
import { TestWrapper } from "@/test/mocks/router";
import { mockSupabase } from "@/test/mocks/supabase";

describe("Auth — Login Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  it("renders login form with email and password fields", () => {
    render(<Auth />, { wrapper: TestWrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("renders quick login buttons for all 8 test roles", () => {
    render(<Auth />, { wrapper: TestWrapper });
    ["Admin", "Técnico", "Produtor", "Cooperativa", "Processador", "Transportador", "Exportador", "Comprador"].forEach((label) => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });
  });

  it("renders tab navigation between login and signup", () => {
    render(<Auth />, { wrapper: TestWrapper });
    expect(screen.getByRole("tab", { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /registar/i })).toBeInTheDocument();
  });

  it("displays back to home link", () => {
    render(<Auth />, { wrapper: TestWrapper });
    expect(screen.getByText(/voltar à página inicial/i)).toBeInTheDocument();
  });

  it("shows password hint on test section", () => {
    render(<Auth />, { wrapper: TestWrapper });
    expect(screen.getByText("Teste123!")).toBeInTheDocument();
  });

  it("renders INCA Coffee Trace branding", () => {
    render(<Auth />, { wrapper: TestWrapper });
    expect(screen.getByText("INCA Coffee Trace")).toBeInTheDocument();
    expect(screen.getByText(/rastreabilidade do café/i)).toBeInTheDocument();
  });
});
