import { describe, it, expect } from "vitest";
import { PROVINCIAS_ANGOLA } from "@/lib/provincias";
import {
  DPA_ANGOLA,
  MUNICIPIOS_POR_PROVINCIA,
  getMunicipios,
  getComunas,
  isMunicipioValido,
  isComunaValida,
} from "@/lib/dpa-angola";

describe("DPA Angola — Província → Município → Comuna", () => {
  it("cobre exactamente as 21 províncias", () => {
    expect(Object.keys(DPA_ANGOLA).sort()).toEqual([...PROVINCIAS_ANGOLA].sort());
  });

  it("cada província tem pelo menos um município", () => {
    for (const p of PROVINCIAS_ANGOLA) {
      expect(MUNICIPIOS_POR_PROVINCIA[p].length).toBeGreaterThan(0);
    }
  });

  it("total de municípios é 326 (DPA oficial 2024)", () => {
    const total = PROVINCIAS_ANGOLA.reduce(
      (acc, p) => acc + MUNICIPIOS_POR_PROVINCIA[p].length,
      0,
    );
    expect(total).toBe(326);
  });

  it("não existem municípios duplicados dentro da mesma província", () => {
    for (const p of PROVINCIAS_ANGOLA) {
      const muns = MUNICIPIOS_POR_PROVINCIA[p];
      expect(new Set(muns).size).toBe(muns.length);
    }
  });

  it("cada comuna pertence a um município existente da sua província", () => {
    for (const p of PROVINCIAS_ANGOLA) {
      for (const m of Object.keys(DPA_ANGOLA[p])) {
        expect(MUNICIPIOS_POR_PROVINCIA[p]).toContain(m);
        const comunas = DPA_ANGOLA[p][m];
        expect(new Set(comunas).size).toBe(comunas.length);
      }
    }
  });

  it("getMunicipios devolve [] para entradas inválidas", () => {
    expect(getMunicipios(undefined)).toEqual([]);
    expect(getMunicipios(null)).toEqual([]);
    expect(getMunicipios("")).toEqual([]);
  });

  it("getComunas devolve [] sem província ou município", () => {
    expect(getComunas(undefined, "Lubango")).toEqual([]);
    expect(getComunas("Huíla", "")).toEqual([]);
  });

  it("validação cruzada: município não pode pertencer a outra província", () => {
    const lubango = MUNICIPIOS_POR_PROVINCIA["Huíla"][0];
    expect(isMunicipioValido("Huíla", lubango)).toBe(true);
    expect(isMunicipioValido("Luanda", lubango)).toBe(false);
  });

  it("validação cruzada: comuna não pode pertencer a outro município", () => {
    const huila = "Huíla";
    const mun = MUNICIPIOS_POR_PROVINCIA[huila].find(
      (m) => DPA_ANGOLA[huila][m].length > 0,
    )!;
    const com = DPA_ANGOLA[huila][mun][0];
    expect(isComunaValida(huila, mun, com)).toBe(true);
    expect(isComunaValida(huila, mun, "ComunaInexistente_XYZ")).toBe(false);
  });
});
