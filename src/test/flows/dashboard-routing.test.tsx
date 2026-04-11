import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "@/pages/Dashboard";
import { TestWrapper } from "@/test/mocks/router";
import "@/test/mocks/supabase";

const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("Dashboard — Role-based Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders AdminDashboard for admin_inca role", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1", email: "admin@test.ao" },
      roles: [{ role: "admin_inca" }],
      hasRole: (r: string) => r === "admin_inca",
      session: {},
      loading: false,
      signOut: vi.fn(),
    });

    render(<Dashboard />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/dashboard administrativo/i)).toBeInTheDocument();
    });
  });

  it("renders AdminDashboard for tecnico_inca role", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u2", email: "tecnico@test.ao" },
      roles: [{ role: "tecnico_inca" }],
      hasRole: (r: string) => r === "tecnico_inca",
      session: {},
      loading: false,
      signOut: vi.fn(),
    });

    render(<Dashboard />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/dashboard administrativo/i)).toBeInTheDocument();
    });
  });

  it("renders ProducerDashboard for produtor role", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u3", email: "produtor@test.ao" },
      roles: [{ role: "produtor" }],
      hasRole: (r: string) => r === "produtor",
      session: {},
      loading: false,
      signOut: vi.fn(),
    });

    render(<Dashboard />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/dashboard do produtor/i)).toBeInTheDocument();
    });
  });

  it("renders fallback for user with no roles", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u9", email: "norole@test.ao" },
      roles: [],
      hasRole: () => false,
      session: {},
      loading: false,
      signOut: vi.fn(),
    });

    render(<Dashboard />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText(/conta configurada/i)).toBeInTheDocument();
      expect(screen.getByText(/nenhum atribuído/i)).toBeInTheDocument();
    });
  });
});
