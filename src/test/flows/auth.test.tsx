import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";

import Auth from "@/pages/Auth";
import { TestWrapper } from "@/test/mocks/router";
import { mockSupabase } from "@/test/mocks/supabase";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

describe("Auth — Login Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
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

  it("redirects to dashboard if already logged in", async () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
      error: null,
    });

    render(<Auth />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
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

  it("displays login quick section with test password", () => {
    render(<Auth />, { wrapper: TestWrapper });
    expect(screen.getByText(/login rápido/i)).toBeInTheDocument();
    expect(screen.getByText("Teste123!")).toBeInTheDocument();
  });

  it("renders INCA Coffee Trace branding", () => {
    render(<Auth />, { wrapper: TestWrapper });
    expect(screen.getByText("INCA Coffee Trace")).toBeInTheDocument();
    expect(screen.getByText(/rastreabilidade do café/i)).toBeInTheDocument();
  });
});

describe("Auth — Registration Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("renders signup form when Registar tab is clicked", async () => {
    render(<Auth />, { wrapper: TestWrapper });
    
    await act(async () => {
      (screen.getByRole("tab", { name: /registar/i }) as HTMLElement).click();
    });

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
  });

  it("signup form has minimum password length hint", async () => {
    render(<Auth />, { wrapper: TestWrapper });
    
    await act(async () => {
      (screen.getByRole("tab", { name: /registar/i }) as HTMLElement).click();
    });

    expect(screen.getByText(/mínimo de 6 caracteres/i)).toBeInTheDocument();
  });

  it("signup form has create account button", async () => {
    render(<Auth />, { wrapper: TestWrapper });
    
    await act(async () => {
      (screen.getByRole("tab", { name: /registar/i }) as HTMLElement).click();
    });

    expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument();
  });
});
