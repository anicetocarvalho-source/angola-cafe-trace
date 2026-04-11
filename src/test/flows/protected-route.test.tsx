import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TestWrapper } from "@/test/mocks/router";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("ProtectedRoute — Access Control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when user is authenticated with correct role", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1" },
      loading: false,
      hasRole: (r: string) => r === "tecnico_inca",
    });

    render(
      <ProtectedRoute requiredRole="tecnico_inca">
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("shows access denied for wrong role", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u2" },
      loading: false,
      hasRole: () => false,
    });

    render(
      <ProtectedRoute requiredRole="admin_inca">
        <div>Admin Only</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    expect(screen.getByText(/acesso negado/i)).toBeInTheDocument();
    expect(screen.queryByText("Admin Only")).not.toBeInTheDocument();
  });

  it("admin_inca bypasses all role checks", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u3" },
      loading: false,
      hasRole: (r: string) => r === "admin_inca",
    });

    render(
      <ProtectedRoute requiredRole="exportador">
        <div>Exporter Page</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    expect(screen.getByText("Exporter Page")).toBeInTheDocument();
  });

  it("redirects to /auth when not logged in", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      hasRole: () => false,
    });

    render(
      <ProtectedRoute>
        <div>Should Not Appear</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    expect(mockNavigate).toHaveBeenCalledWith("/auth");
    expect(screen.queryByText("Should Not Appear")).not.toBeInTheDocument();
  });

  it("shows loading spinner while auth is loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      hasRole: () => false,
    });

    render(
      <ProtectedRoute>
        <div>Content</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    // Should show spinner, not content
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders without requiredRole when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u4" },
      loading: false,
      hasRole: () => false,
    });

    render(
      <ProtectedRoute>
        <div>Any Authenticated User</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    expect(screen.getByText("Any Authenticated User")).toBeInTheDocument();
  });
});
