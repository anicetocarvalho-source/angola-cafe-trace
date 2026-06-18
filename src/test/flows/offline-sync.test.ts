import { describe, it, expect, vi } from "vitest";
import { OfflineQueue } from "@/lib/flowValidation";

describe("Sincronização offline → online", () => {
  it("enfileira operações enquanto está offline e não envia nada", async () => {
    const q = new OfflineQueue();
    q.enqueue({ table: "colheitas", action: "insert", payload: { quantidade_kg: 50 } });
    q.enqueue({ table: "logistica", action: "insert", payload: { rota: "Huambo-Luanda" } });

    const executor = vi.fn();
    const res = await q.flush(executor, { isOnline: () => false });

    expect(executor).not.toHaveBeenCalled();
    expect(res.synced).toHaveLength(0);
    expect(res.remaining).toHaveLength(2);
    expect(q.size()).toBe(2);
  });

  it("envia tudo em ordem FIFO quando volta online", async () => {
    const q = new OfflineQueue();
    const a = q.enqueue({ table: "colheitas", action: "insert", payload: { n: 1 } });
    await new Promise((r) => setTimeout(r, 2));
    const b = q.enqueue({ table: "colheitas", action: "insert", payload: { n: 2 } });

    const calls: string[] = [];
    const executor = vi.fn(async (op) => {
      calls.push(op.id);
    });

    const res = await q.flush(executor, { isOnline: () => true });
    expect(calls).toEqual([a.id, b.id]);
    expect(res.synced).toHaveLength(2);
    expect(q.size()).toBe(0);
  });

  it("mantém a operação na fila enquanto há tentativas restantes", async () => {
    const q = new OfflineQueue();
    q.enqueue({ table: "lotes", action: "insert", payload: {} });
    const executor = vi.fn(async () => {
      throw new Error("network");
    });

    const res = await q.flush(executor, { maxAttempts: 3 });
    expect(res.synced).toHaveLength(0);
    expect(res.failed).toHaveLength(0);
    expect(res.remaining).toHaveLength(1);
    expect(q.peek()[0].attempts).toBe(1);
  });

  it("move para 'failed' depois de esgotar tentativas máximas", async () => {
    const q = new OfflineQueue();
    q.enqueue({ table: "lotes", action: "insert", payload: {} });
    const executor = vi.fn(async () => {
      throw new Error("fatal");
    });

    await q.flush(executor, { maxAttempts: 2 });
    const res = await q.flush(executor, { maxAttempts: 2 });

    expect(res.failed).toHaveLength(1);
    expect(res.failed[0].error).toBe("fatal");
    expect(q.size()).toBe(0);
  });

  it("mantém na fila apenas as operações que falharam", async () => {
    const q = new OfflineQueue();
    const ok = q.enqueue({ table: "colheitas", action: "insert", payload: { n: 1 } });
    const ko = q.enqueue({ table: "logistica", action: "insert", payload: { n: 2 } });

    const executor = vi.fn(async (op) => {
      if (op.id === ko.id) throw new Error("conflict");
    });

    const res = await q.flush(executor);
    expect(res.synced.map((o) => o.id)).toEqual([ok.id]);
    expect(q.peek().map((o) => o.id)).toEqual([ko.id]);
  });
});
