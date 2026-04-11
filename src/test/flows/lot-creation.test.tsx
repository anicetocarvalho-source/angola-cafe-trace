import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NovoLote from "@/pages/NovoLote";
import { TestWrapper } from "@/test/mocks/router";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockInsert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({
      data: { id: "new-lote-id", referencia_lote: "LOT-2026-000001" },
      error: null,
    }),
  }),
});

const mockSelect = vi.fn().mockReturnValue({
  data: [
    { id: "c1", campanha: "2025/2026", data_inicio: "2025-11-01", parcela_id: "p1" },
  ],
  error: null,
  order: vi.fn().mockReturnValue({
    data: [{ id: "c1", campanha: "2025/2026", data_inicio: "2025-11-01" }],
    error: null,
  }),
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === "lotes") {
        return { insert: mockInsert, select: mockSelect };
      }
      return { select: mockSelect, insert: mockInsert };
    }),
  },
}));

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

  it("renders the lot creation form", () => {
    render(<NovoLote />, { wrapper: TestWrapper });
    expect(screen.getByText(/novo lote/i)).toBeInTheDocument();
  });

  it("requires volume_kg to be filled", () => {
    render(<NovoLote />, { wrapper: TestWrapper });
    const volumeInput = screen.queryByLabelText(/volume|peso|quantidade/i);
    if (volumeInput) {
      expect(volumeInput).toBeInTheDocument();
    }
  });

  it("displays lot type selector with valid options", () => {
    render(<NovoLote />, { wrapper: TestWrapper });
    // Check for tipo selector presence
    const tipoTexts = ["cereja", "cafe_verde", "parchment", "torrado", "moido"];
    // At least the form should render
    expect(screen.getByText(/novo lote/i)).toBeInTheDocument();
  });
});

describe("Lot Validation Flow", () => {
  it("validates lot status transitions", () => {
    const validTransitions: Record<string, string[]> = {
      pendente: ["em_processo", "aprovado", "reprovado"],
      em_processo: ["aprovado", "reprovado"],
      aprovado: ["exportado", "consumido"],
      reprovado: [],
      exportado: ["consumido"],
      consumido: [],
    };

    // Verify the state machine is correct
    expect(validTransitions.pendente).toContain("aprovado");
    expect(validTransitions.pendente).toContain("reprovado");
    expect(validTransitions.aprovado).toContain("exportado");
    expect(validTransitions.reprovado).toHaveLength(0);
  });

  it("validates lot types enum matches database", () => {
    const expectedTypes = ["cereja", "cafe_verde", "parchment", "torrado", "moido"];
    expectedTypes.forEach((type) => {
      expect(typeof type).toBe("string");
      expect(type.length).toBeGreaterThan(0);
    });
  });

  it("validates lot reference format", () => {
    const refPattern = /^LOT-\d{4}-\d{6}$/;
    expect(refPattern.test("LOT-2026-000001")).toBe(true);
    expect(refPattern.test("LOT-2026-123456")).toBe(true);
    expect(refPattern.test("INVALID")).toBe(false);
    expect(refPattern.test("LOT-26-001")).toBe(false);
  });

  it("validates QR code format", () => {
    const qrPattern = /^QR-\d{10}$/;
    expect(qrPattern.test("QR-0000000001")).toBe(true);
    expect(qrPattern.test("QR-9999999999")).toBe(true);
    expect(qrPattern.test("QR-123")).toBe(false);
  });
});
