import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  });

  it("renders login form with email and password fields", () => {
    render(<Auth />, { wrapper: TestWrapper });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("renders quick login buttons for all 8 test roles", () => {
    render(<Auth />, { wrapper: TestWrapper });
    const roleLabels = ["Admin", "Técnico", "Produtor", "Cooperativa", "Processador", "Transportador", "Exportador", "Comprador"];
    roleLabels.forEach((label) => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });
  });

  it("quick login button calls signInWithPassword with correct email", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "u2", email: "produtor@teste.ao" }, session: {} },
      error: null,
    });

    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByRole("button", { name: "Produtor" }));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "produtor@teste.ao",
        password: "Teste123!",
      });
    });
  });

  it("quick login as Admin uses correct email", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "u1", email: "anicetojjc@gmail.com" }, session: {} },
      error: null,
    });

    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByRole("button", { name: "Admin" }));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "anicetojjc@gmail.com",
        password: "Teste123!",
      });
    });
  });

  it("quick login as Técnico uses correct email", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "u3", email: "tecnico@teste.ao" }, session: {} },
      error: null,
    });

    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByRole("button", { name: "Técnico" }));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "tecnico@teste.ao",
        password: "Teste123!",
      });
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
});

describe("Auth — Registration Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it("renders signup form when Registar tab is clicked", async () => {
    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByRole("tab", { name: /registar/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });
  });

  it("signup form has minimum password length hint", async () => {
    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByRole("tab", { name: /registar/i }));

    await waitFor(() => {
      expect(screen.getByText(/mínimo de 6 caracteres/i)).toBeInTheDocument();
    });
  });

  it("signup form has create account button", async () => {
    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByRole("tab", { name: /registar/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument();
    });
  });
});
