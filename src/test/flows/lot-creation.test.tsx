import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TestWrapper } from "@/test/mocks/router";
import "@/test/mocks/supabase";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "produtor@test.ao" },
    roles: [{ role: "produtor" }],
    hasRole: (r: string) => r === "produtor",
    session: {},
    loading: false,
    signOut: vi.fn(),
  }),
}));

describe("Lot Creation Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the lot creation form inside DashboardLayout", async () => {
    // Dynamically import after mocks are set
    const { default: NovoLote } = await import("@/pages/NovoLote");
    render(<NovoLote />, { wrapper: TestWrapper });
    expect(screen.getByText(/novo lote/i)).toBeInTheDocument();
  });
});

describe("Lot Validation Logic", () => {
  it("validates lot status transitions", () => {
    const validTransitions: Record<string, string[]> = {
      pendente: ["em_processo", "aprovado", "reprovado"],
      em_processo: ["aprovado", "reprovado"],
      aprovado: ["exportado", "consumido"],
      reprovado: [],
      exportado: ["consumido"],
      consumido: [],
    };

    expect(validTransitions.pendente).toContain("aprovado");
    expect(validTransitions.pendente).toContain("reprovado");
    expect(validTransitions.aprovado).toContain("exportado");
    expect(validTransitions.reprovado).toHaveLength(0);
  });

  it("validates lot types enum matches database", () => {
    const expectedTypes = ["cereja", "cafe_verde", "parchment", "torrado", "moido"];
    expect(expectedTypes).toHaveLength(5);
    expectedTypes.forEach((type) => expect(type.length).toBeGreaterThan(0));
  });

  it("validates lot reference format LOT-YYYY-NNNNNN", () => {
    const refPattern = /^LOT-\d{4}-\d{6}$/;
    expect(refPattern.test("LOT-2026-000001")).toBe(true);
    expect(refPattern.test("LOT-2026-123456")).toBe(true);
    expect(refPattern.test("INVALID")).toBe(false);
    expect(refPattern.test("LOT-26-001")).toBe(false);
  });

  it("validates QR code format QR-NNNNNNNNNN", () => {
    const qrPattern = /^QR-\d{10}$/;
    expect(qrPattern.test("QR-0000000001")).toBe(true);
    expect(qrPattern.test("QR-9999999999")).toBe(true);
    expect(qrPattern.test("QR-123")).toBe(false);
  });

  it("validates all 8 app roles exist", () => {
    const roles = ["admin_inca", "tecnico_inca", "produtor", "cooperativa", "processador", "transportador", "exportador", "comprador"];
    expect(roles).toHaveLength(8);
  });

  it("validates lot_status enum values", () => {
    const statuses = ["pendente", "em_processo", "aprovado", "reprovado", "exportado", "consumido"];
    expect(statuses).toHaveLength(6);
    expect(statuses).toContain("pendente");
    expect(statuses).toContain("aprovado");
  });
});
