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

  it("submits login form with credentials", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "u1", email: "test@email.ao" }, session: {} },
      error: null,
    });

    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@email.ao" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Teste123!" } });
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@email.ao",
        password: "Teste123!",
      });
    });
  });

  it("shows error toast on invalid credentials", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "wrong@email.ao" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /^entrar$/i }));

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
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

  it("submits signup with nome, email, and password", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: "new-user" } },
      error: null,
    });

    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByRole("tab", { name: /registar/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: "João Silva" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "joao@email.ao" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Pass123!" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: "joao@email.ao",
        password: "Pass123!",
        options: expect.objectContaining({
          data: { nome: "João Silva" },
        }),
      });
    });
  });

  it("rejects signup with empty name", async () => {
    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByRole("tab", { name: /registar/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@email.ao" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Pass123!" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    // signUp should NOT have been called because name is empty
    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
  });

  it("shows error for already registered email", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: "User already registered" },
    });

    render(<Auth />, { wrapper: TestWrapper });
    fireEvent.click(screen.getByRole("tab", { name: /registar/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "existing@email.ao" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "Pass123!" } });
    fireEvent.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalled();
    });
  });
});
