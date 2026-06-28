import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { PROVINCIAS_ANGOLA } from "@/lib/provincias";

const EXPECTED_21 = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando", "Cuanza Norte",
  "Cuanza Sul", "Cubango", "Cunene", "Huambo", "Huíla", "Icolo e Bengo",
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Moxico Leste",
  "Namibe", "Uíge", "Zaire",
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "test" || entry === "__tests__") continue;
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

describe("Lista centralizada de províncias (21, reforma 2024)", () => {
  it("PROVINCIAS_ANGOLA contém exactamente as 21 províncias actuais", () => {
    expect(PROVINCIAS_ANGOLA).toHaveLength(21);
    expect([...PROVINCIAS_ANGOLA].sort()).toEqual([...EXPECTED_21].sort());
  });

  it("inclui as novas províncias da reforma de 2024", () => {
    expect(PROVINCIAS_ANGOLA).toContain("Cuando");
    expect(PROVINCIAS_ANGOLA).toContain("Cubango");
    expect(PROVINCIAS_ANGOLA).toContain("Icolo e Bengo");
    expect(PROVINCIAS_ANGOLA).toContain("Moxico Leste");
  });

  it("já não contém a antiga 'Cuando Cubango'", () => {
    expect(PROVINCIAS_ANGOLA as readonly string[]).not.toContain("Cuando Cubango");
  });

  it("está ordenada alfabeticamente", () => {
    const sorted = [...PROVINCIAS_ANGOLA].sort((a, b) => a.localeCompare(b, "pt"));
    expect([...PROVINCIAS_ANGOLA]).toEqual(sorted);
  });

  it("não há valores duplicados", () => {
    expect(new Set(PROVINCIAS_ANGOLA).size).toBe(PROVINCIAS_ANGOLA.length);
  });
});

describe("Regressão: nenhum ficheiro reintroduz lista hardcoded de províncias", () => {
  const files = walk("src").filter(
    (f) =>
      !f.includes("/test/") &&
      !f.endsWith("provincias.ts") &&
      !f.includes("integrations/supabase/types.ts"),
  );

  it("nenhum ficheiro contém a string 'Cuando Cubango' (nome antigo)", () => {
    const offenders = files.filter((f) =>
      readFileSync(f, "utf8").includes("Cuando Cubango"),
    );
    expect(offenders).toEqual([]);
  });

  it("nenhuma página define um array literal de províncias (deve usar PROVINCIAS_ANGOLA)", () => {
    // Detecta arrays como ["Bengo", "Benguela", ...] com 3+ nomes de províncias seguidos
    const provNames = EXPECTED_21.map((p) => `["']${p}["']`).join("\\s*,\\s*");
    const triplets = EXPECTED_21.slice(0, -2).map((_, i) =>
      EXPECTED_21.slice(i, i + 3).map((p) => `["']${p}["']`).join("\\s*,\\s*"),
    );
    const regex = new RegExp(triplets.join("|"));
    const offenders = files.filter((f) => regex.test(readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
    // suppress unused
    void provNames;
  });

  it("páginas com select de província importam PROVINCIAS_ANGOLA", () => {
    // Heurística: ficheiros que mencionam 'Província' num <Select…> devem importar da fonte única
    const pageFiles = files.filter((f) => f.includes("/pages/") || f.includes("/components/"));
    const offenders: string[] = [];
    for (const f of pageFiles) {
      const src = readFileSync(f, "utf8");
      const hasProvinciaSelect =
        /placeholder=["'][^"']*Provín?cia/i.test(src) &&
        /<Select(Trigger|\s)/.test(src);
      const derivesFromData =
        /new Set\(/.test(src) && /\.provincia/.test(src) ||
        /provincias\s*=\s*useMemo/.test(src) ||
        /\.provincia\b/.test(src);
      const importsCentral = /from\s+["']@\/lib\/provincias["']/.test(src);
      if (hasProvinciaSelect && !derivesFromData && !importsCentral) {
        offenders.push(f);
      }
    }
    expect(offenders).toEqual([]);
  });
});
