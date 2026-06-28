import { describe, it, expect } from "vitest";
import { z } from "zod";
import { PROVINCIAS_ANGOLA } from "@/lib/provincias";

// Espelha o schema usado em src/pages/NovaExploracao.tsx para garantir
// que apenas valores da lista oficial das 21 províncias são aceites.
const provinciaSchema = z.enum(PROVINCIAS_ANGOLA, {
  errorMap: () => ({ message: "Província inválida" }),
});

describe("Validação de província no formulário de exploração", () => {
  it.each([...PROVINCIAS_ANGOLA])("aceita %s", (p) => {
    expect(provinciaSchema.safeParse(p).success).toBe(true);
  });

  it("rejeita 'Cuando Cubango' (nome antigo da reforma)", () => {
    expect(provinciaSchema.safeParse("Cuando Cubango").success).toBe(false);
  });

  it.each(["", "Lisboa", "Cuanza", "huambo", "BENGUELA", "Outra"])(
    "rejeita valor inválido: %s",
    (v) => {
      expect(provinciaSchema.safeParse(v).success).toBe(false);
    },
  );

  it("rejeita não-strings", () => {
    expect(provinciaSchema.safeParse(null).success).toBe(false);
    expect(provinciaSchema.safeParse(undefined).success).toBe(false);
    expect(provinciaSchema.safeParse(123).success).toBe(false);
  });
});
