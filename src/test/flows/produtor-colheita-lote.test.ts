import { describe, it, expect } from "vitest";
import {
  isValidLotReference,
  validateProdutorColheitaLoteChain,
  type Produtor,
  type Exploracao,
  type Parcela,
  type Colheita,
  type Lote,
} from "@/lib/flowValidation";

const produtor: Produtor = { id: "p1", nome_legal: "Cooperativa Kwanza" };
const exploracao: Exploracao = { id: "e1", produtor_id: "p1" };
const parcela: Parcela = { id: "pa1", exploracao_id: "e1" };
const colheita: Colheita = { id: "c1", parcela_id: "pa1", quantidade_kg: 1000 };
const lote: Lote = { id: "l1", referencia_lote: "LOT-2026-000123", colheita_id: "c1", quantidade_kg: 800 };

describe("Fluxo produtor → colheita → lote", () => {
  it("aceita uma cadeia completa válida", () => {
    const res = validateProdutorColheitaLoteChain({
      produtores: [produtor],
      exploracoes: [exploracao],
      parcelas: [parcela],
      colheitas: [colheita],
      lote,
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.produtor.id).toBe("p1");
  });

  it("valida o formato da referência LOT-YYYY-NNNNNN", () => {
    expect(isValidLotReference("LOT-2026-000001")).toBe(true);
    expect(isValidLotReference("LOT-26-1")).toBe(false);
    expect(isValidLotReference("lot-2026-000001")).toBe(false);
  });

  it("rejeita lote sem colheita associada", () => {
    const res = validateProdutorColheitaLoteChain({
      produtores: [produtor],
      exploracoes: [exploracao],
      parcelas: [parcela],
      colheitas: [colheita],
      lote: { ...lote, colheita_id: null },
    });
    expect(res).toEqual({ ok: false, reason: "lote_sem_colheita" });
  });

  it.each([
    ["colheita_inexistente", { lote: { ...lote, colheita_id: "missing" } }],
    ["parcela_inexistente", { parcelas: [] as Parcela[] }],
    ["exploracao_inexistente", { exploracoes: [] as Exploracao[] }],
    ["produtor_inexistente", { produtores: [] as Produtor[] }],
  ])("falha quando %s", (reason, overrides: any) => {
    const res = validateProdutorColheitaLoteChain({
      produtores: [produtor],
      exploracoes: [exploracao],
      parcelas: [parcela],
      colheitas: [colheita],
      lote,
      ...overrides,
    });
    expect(res).toEqual({ ok: false, reason });
  });

  it("impede que o lote exceda a quantidade da colheita", () => {
    const res = validateProdutorColheitaLoteChain({
      produtores: [produtor],
      exploracoes: [exploracao],
      parcelas: [parcela],
      colheitas: [{ ...colheita, quantidade_kg: 500 }],
      lote: { ...lote, quantidade_kg: 999 },
    });
    expect(res).toEqual({ ok: false, reason: "lote_excede_colheita" });
  });
});
