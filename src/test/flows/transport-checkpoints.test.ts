import { describe, it, expect } from "vitest";
import { validateCheckpoints, type Checkpoint } from "@/lib/flowValidation";

const cp = (over: Partial<Checkpoint> = {}): Checkpoint => ({
  timestamp: "2026-06-01T08:00:00Z",
  local: "Huambo",
  lat: -12.77,
  lng: 15.74,
  temp_c: 22,
  humidade_percent: 55,
  ...over,
});

describe("Transporte com checkpoints", () => {
  it("aceita uma sequência cronológica válida", () => {
    const res = validateCheckpoints([
      cp({ timestamp: "2026-06-01T08:00:00Z", local: "Huambo" }),
      cp({ timestamp: "2026-06-01T12:30:00Z", local: "Sumbe" }),
      cp({ timestamp: "2026-06-01T18:00:00Z", local: "Luanda" }),
    ]);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual([]);
  });

  it("rejeita lista vazia", () => {
    expect(validateCheckpoints([])).toEqual({ valid: false, errors: ["sem_checkpoints"] });
  });

  it("detecta checkpoints fora de ordem cronológica", () => {
    const res = validateCheckpoints([
      cp({ timestamp: "2026-06-01T12:00:00Z" }),
      cp({ timestamp: "2026-06-01T08:00:00Z" }),
    ]);
    expect(res.valid).toBe(false);
    expect(res.errors).toContain("checkpoint_1_fora_de_ordem");
  });

  it("sinaliza limites de temperatura e humidade excedidos", () => {
    const res = validateCheckpoints(
      [cp({ temp_c: 40, humidade_percent: 90 })],
      { maxTempC: 30, maxHumidadePercent: 75 },
    );
    expect(res.valid).toBe(false);
    expect(res.errors).toEqual(
      expect.arrayContaining(["checkpoint_0_temp_excedida", "checkpoint_0_humidade_excedida"]),
    );
  });

  it("valida coordenadas GPS", () => {
    const res = validateCheckpoints([cp({ lat: 120, lng: -999 })]);
    expect(res.errors).toEqual(
      expect.arrayContaining(["checkpoint_0_lat_invalida", "checkpoint_0_lng_invalida"]),
    );
  });

  it("exige local em cada checkpoint", () => {
    const res = validateCheckpoints([cp({ local: "" })]);
    expect(res.errors).toContain("checkpoint_0_sem_local");
  });
});
