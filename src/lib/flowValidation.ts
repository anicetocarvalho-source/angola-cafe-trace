/**
 * Pure helpers used to validate critical business flows.
 * They contain no I/O so they can be exercised by unit tests
 * without mocking the network.
 */

export type Produtor = { id: string; nome_legal: string };
export type Exploracao = { id: string; produtor_id: string };
export type Parcela = { id: string; exploracao_id: string };
export type Colheita = { id: string; parcela_id: string; data_colheita?: string; quantidade_kg?: number };
export type Lote = {
  id: string;
  referencia_lote: string;
  colheita_id: string | null;
  quantidade_kg?: number;
};

/** LOT-YYYY-NNNNNN */
export const LOT_REFERENCE_REGEX = /^LOT-\d{4}-\d{6}$/;

export function isValidLotReference(ref: string): boolean {
  return LOT_REFERENCE_REGEX.test(ref);
}

export type ChainResult =
  | { ok: true; produtor: Produtor; exploracao: Exploracao; parcela: Parcela; colheita: Colheita; lote: Lote }
  | { ok: false; reason: string };

/**
 * Walks produtor → exploração → parcela → colheita → lote and
 * fails fast at the first broken link.
 */
export function validateProdutorColheitaLoteChain(input: {
  produtores: Produtor[];
  exploracoes: Exploracao[];
  parcelas: Parcela[];
  colheitas: Colheita[];
  lote: Lote;
}): ChainResult {
  const { produtores, exploracoes, parcelas, colheitas, lote } = input;

  if (!lote.colheita_id) return { ok: false, reason: "lote_sem_colheita" };
  if (!isValidLotReference(lote.referencia_lote)) return { ok: false, reason: "referencia_invalida" };

  const colheita = colheitas.find((c) => c.id === lote.colheita_id);
  if (!colheita) return { ok: false, reason: "colheita_inexistente" };

  const parcela = parcelas.find((p) => p.id === colheita.parcela_id);
  if (!parcela) return { ok: false, reason: "parcela_inexistente" };

  const exploracao = exploracoes.find((e) => e.id === parcela.exploracao_id);
  if (!exploracao) return { ok: false, reason: "exploracao_inexistente" };

  const produtor = produtores.find((pr) => pr.id === exploracao.produtor_id);
  if (!produtor) return { ok: false, reason: "produtor_inexistente" };

  if (lote.quantidade_kg != null && colheita.quantidade_kg != null && lote.quantidade_kg > colheita.quantidade_kg) {
    return { ok: false, reason: "lote_excede_colheita" };
  }

  return { ok: true, produtor, exploracao, parcela, colheita, lote };
}

// ---------------------------------------------------------------------------
// Transporte com checkpoints
// ---------------------------------------------------------------------------

export type Checkpoint = {
  timestamp: string; // ISO date
  local: string;
  lat?: number;
  lng?: number;
  temp_c?: number;
  humidade_percent?: number;
};

export type CheckpointValidation = {
  valid: boolean;
  errors: string[];
};

export function validateCheckpoints(
  checkpoints: Checkpoint[],
  opts: { maxTempC?: number; maxHumidadePercent?: number } = {},
): CheckpointValidation {
  const errors: string[] = [];
  const { maxTempC = 30, maxHumidadePercent = 75 } = opts;

  if (!Array.isArray(checkpoints) || checkpoints.length === 0) {
    return { valid: false, errors: ["sem_checkpoints"] };
  }

  let previous: number | null = null;
  checkpoints.forEach((c, i) => {
    const t = Date.parse(c.timestamp);
    if (Number.isNaN(t)) errors.push(`checkpoint_${i}_timestamp_invalido`);
    else if (previous != null && t < previous) errors.push(`checkpoint_${i}_fora_de_ordem`);
    else previous = t;

    if (!c.local || c.local.trim() === "") errors.push(`checkpoint_${i}_sem_local`);
    if (c.lat != null && (c.lat < -90 || c.lat > 90)) errors.push(`checkpoint_${i}_lat_invalida`);
    if (c.lng != null && (c.lng < -180 || c.lng > 180)) errors.push(`checkpoint_${i}_lng_invalida`);
    if (c.temp_c != null && c.temp_c > maxTempC) errors.push(`checkpoint_${i}_temp_excedida`);
    if (c.humidade_percent != null && c.humidade_percent > maxHumidadePercent)
      errors.push(`checkpoint_${i}_humidade_excedida`);
  });

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Fila de sincronização offline → online
// ---------------------------------------------------------------------------

export type QueuedOp = {
  id: string;
  table: string;
  action: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  createdAt: number;
  attempts: number;
};

export type SyncResult = {
  synced: QueuedOp[];
  failed: { op: QueuedOp; error: string }[];
  remaining: QueuedOp[];
};

export class OfflineQueue {
  private queue: QueuedOp[] = [];

  enqueue(op: Omit<QueuedOp, "id" | "createdAt" | "attempts">) {
    const full: QueuedOp = {
      ...op,
      id: `${op.table}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      attempts: 0,
    };
    this.queue.push(full);
    return full;
  }

  size() {
    return this.queue.length;
  }

  peek() {
    return [...this.queue];
  }

  clear() {
    this.queue = [];
  }

  async flush(
    executor: (op: QueuedOp) => Promise<void>,
    opts: { maxAttempts?: number; isOnline?: () => boolean } = {},
  ): Promise<SyncResult> {
    const { maxAttempts = 3, isOnline = () => true } = opts;
    const synced: QueuedOp[] = [];
    const failed: { op: QueuedOp; error: string }[] = [];

    if (!isOnline()) {
      return { synced, failed, remaining: [...this.queue] };
    }

    // Preserve FIFO ordering.
    const pending = [...this.queue].sort((a, b) => a.createdAt - b.createdAt);
    const keep: QueuedOp[] = [];

    for (const op of pending) {
      try {
        await executor(op);
        synced.push(op);
      } catch (err) {
        op.attempts += 1;
        const message = err instanceof Error ? err.message : String(err);
        if (op.attempts >= maxAttempts) {
          failed.push({ op, error: message });
        } else {
          keep.push(op);
        }
      }
    }

    this.queue = keep;
    return { synced, failed, remaining: keep };
  }
}
