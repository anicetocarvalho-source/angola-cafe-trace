import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, GitBranch, GitMerge, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface LoteNode {
  id: string;
  referencia_lote: string;
  tipo: string;
  volume_kg: number;
  estado: string | null;
  tipo_transformacao: string | null;
  parent_lote_ids: string[] | null;
}

interface TreeNode {
  lote: LoteNode;
  parents: TreeNode[];
  children: TreeNode[];
  isCurrent: boolean;
}

interface LoteGenealogyProps {
  loteId: string;
}

interface SvgLine {
  x1: number; y1: number; x2: number; y2: number; label?: string;
}

const MAX_DEPTH = 5;
const CARD_W = 190;
const CARD_H = 90;
const GAP_X = 28;
const GAP_Y = 60;

// Flatten tree into rows for layout
function collectAncestorRows(node: TreeNode): TreeNode[][] {
  const rows: TreeNode[][] = [];
  let currentLevel = node.parents;
  while (currentLevel.length > 0) {
    // Deduplicate nodes at the same level by lote id
    const seen = new Set<string>();
    const deduped: TreeNode[] = [];
    for (const n of currentLevel) {
      if (!seen.has(n.lote.id)) {
        seen.add(n.lote.id);
        deduped.push(n);
      }
    }
    rows.unshift([...deduped]);
    const nextLevel: TreeNode[] = [];
    for (const n of deduped) {
      nextLevel.push(...n.parents);
    }
    currentLevel = nextLevel;
  }
  return rows;
}

function collectDescendantRows(node: TreeNode): TreeNode[][] {
  const rows: TreeNode[][] = [];
  let currentLevel = node.children;
  while (currentLevel.length > 0) {
    rows.push([...currentLevel]);
    const nextLevel: TreeNode[] = [];
    for (const n of currentLevel) {
      nextLevel.push(...n.children);
    }
    currentLevel = nextLevel;
  }
  return rows;
}

const LoteGenealogy = ({ loteId }: LoteGenealogyProps) => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchedIds] = useState(new Set<string>());

  const fetchLote = useCallback(async (id: string): Promise<LoteNode | null> => {
    const { data, error } = await supabase
      .from("lotes")
      .select("id, referencia_lote, tipo, volume_kg, estado, tipo_transformacao, parent_lote_ids")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as LoteNode;
  }, []);

  const fetchChildren = useCallback(async (id: string): Promise<LoteNode[]> => {
    const { data, error } = await supabase
      .from("lotes")
      .select("id, referencia_lote, tipo, volume_kg, estado, tipo_transformacao, parent_lote_ids")
      .contains("parent_lote_ids", [id]);
    if (error) return [];
    return (data || []) as LoteNode[];
  }, []);

  const buildAncestors = useCallback(async (lote: LoteNode, depth: number, isCurrent: boolean): Promise<TreeNode> => {
    const node: TreeNode = { lote, parents: [], children: [], isCurrent };
    if (depth >= MAX_DEPTH) return node;
    fetchedIds.add(lote.id);
    const parentIds = (lote.parent_lote_ids || []).filter(id => id && !fetchedIds.has(id));
    if (parentIds.length > 0) {
      const parents = await Promise.all(parentIds.map(async (pid) => {
        const p = await fetchLote(pid);
        if (!p) return null;
        return buildAncestors(p, depth + 1, false);
      }));
      node.parents = parents.filter(Boolean) as TreeNode[];
    }
    return node;
  }, [fetchLote, fetchedIds]);

  const buildDescendants = useCallback(async (node: TreeNode, depth: number): Promise<void> => {
    if (depth >= MAX_DEPTH) return;
    const childLotes = await fetchChildren(node.lote.id);
    for (const child of childLotes) {
      if (fetchedIds.has(child.id)) continue;
      fetchedIds.add(child.id);
      const childNode: TreeNode = { lote: child, parents: [], children: [], isCurrent: false };
      node.children.push(childNode);
      await buildDescendants(childNode, depth + 1);
    }
  }, [fetchChildren, fetchedIds]);

  useEffect(() => {
    const buildTree = async () => {
      setLoading(true);
      fetchedIds.clear();
      const currentLote = await fetchLote(loteId);
      if (!currentLote) { setLoading(false); return; }
      const rootNode = await buildAncestors(currentLote, 0, true);
      await buildDescendants(rootNode, 0);
      setTree(rootNode);
      setLoading(false);
    };
    buildTree();
  }, [loteId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">A construir árvore genealógica…</span>
        </CardContent>
      </Card>
    );
  }

  if (!tree) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Não foi possível carregar a genealogia deste lote.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Genealogia do Lote
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <GenealogyDiagram tree={tree} />
      </CardContent>
    </Card>
  );
};

// ─── Diagram with SVG connectors ───

interface PositionedNode {
  node: TreeNode;
  x: number;
  y: number;
}

function layoutTree(tree: TreeNode): { nodes: PositionedNode[]; lines: SvgLine[]; width: number; height: number } {
  const ancestorRows = collectAncestorRows(tree);
  const descendantRows = collectDescendantRows(tree);

  const allRows: { nodes: TreeNode[]; label?: string }[] = [];
  ancestorRows.forEach((row, i) => allRows.push({ nodes: row, label: i === 0 ? "Ascendência" : undefined }));
  allRows.push({ nodes: [tree] });
  descendantRows.forEach((row, i) => allRows.push({ nodes: row, label: i === 0 ? "Descendência" : undefined }));

  const currentRowIndex = ancestorRows.length;

  // Compute positions
  const positioned: PositionedNode[] = [];
  const idToPos = new Map<string, { cx: number; cy: number }>();

  // Find max row width for centering
  const maxRowWidth = Math.max(...allRows.map(r => r.nodes.length * CARD_W + (r.nodes.length - 1) * GAP_X));
  const totalWidth = Math.max(maxRowWidth, CARD_W) + 40; // padding

  allRows.forEach((row, rowIdx) => {
    const rowWidth = row.nodes.length * CARD_W + (row.nodes.length - 1) * GAP_X;
    const startX = (totalWidth - rowWidth) / 2;
    const y = rowIdx * (CARD_H + GAP_Y);

    row.nodes.forEach((n, colIdx) => {
      const x = startX + colIdx * (CARD_W + GAP_X);
      positioned.push({ node: n, x, y });
      idToPos.set(n.lote.id, { cx: x + CARD_W / 2, cy: y + CARD_H / 2 });
    });
  });

  const totalHeight = allRows.length * (CARD_H + GAP_Y) - GAP_Y;

  // Build SVG lines: parent → child connections (deduplicated)
  const lines: SvgLine[] = [];
  const lineKeys = new Set<string>();

  function addLine(fromId: string, toId: string) {
    const key = `${fromId}->${toId}`;
    if (lineKeys.has(key)) return;
    lineKeys.add(key);
    const fromPos = idToPos.get(fromId);
    const toPos = idToPos.get(toId);
    if (fromPos && toPos) {
      lines.push({
        x1: fromPos.cx,
        y1: fromPos.cy + CARD_H / 2,
        x2: toPos.cx,
        y2: toPos.cy - CARD_H / 2,
      });
    }
  }

  function addParentLines(node: TreeNode) {
    for (const parent of node.parents) {
      addLine(parent.lote.id, node.lote.id);
      addParentLines(parent);
    }
  }

  function addChildLines(node: TreeNode) {
    for (const child of node.children) {
      addLine(node.lote.id, child.lote.id);
      addChildLines(child);
    }
  }

  addParentLines(tree);
  addChildLines(tree);

  return { nodes: positioned, lines, width: totalWidth, height: totalHeight };
}

const GenealogyDiagram = ({ tree }: { tree: TreeNode }) => {
  const hasAncestors = tree.parents.length > 0;
  const hasDescendants = tree.children.length > 0;

  if (!hasAncestors && !hasDescendants) {
    return (
      <p className="text-muted-foreground text-center py-4">
        Este lote não tem ascendentes nem descendentes registados.
      </p>
    );
  }

  const { nodes, lines, width, height } = layoutTree(tree);

  return (
    <div className="relative" style={{ minWidth: width, minHeight: height }}>
      {/* SVG layer for connectors */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
        style={{ zIndex: 0 }}
      >
        <defs>
          <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="4"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 8 3, 0 6"
              fill="hsl(var(--primary))"
              fillOpacity="0.4"
            />
          </marker>
        </defs>
        {lines.map((line, i) => {
          const midY = (line.y1 + line.y2) / 2;
          const d = `M ${line.x1} ${line.y1} C ${line.x1} ${midY}, ${line.x2} ${midY}, ${line.x2} ${line.y2}`;
          // Approximate Bézier length for dash animation
          const dx = line.x2 - line.x1;
          const dy = line.y2 - line.y1;
          const len = Math.sqrt(dx * dx + dy * dy) * 1.3;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="url(#line-grad)"
              strokeWidth="2"
              strokeLinecap="round"
              markerEnd="url(#arrowhead)"
              strokeDasharray={len}
              strokeDashoffset={len}
              style={{
                animation: `genealogy-draw 0.8s ease-out ${0.3 + i * 0.15}s forwards`,
              }}
            />
          );
        })}
      </svg>

      {/* Node cards */}
      {nodes.map(({ node, x, y }) => (
        <div
          key={node.lote.id}
          className="absolute"
          style={{ left: x, top: y, width: CARD_W, height: CARD_H, zIndex: 1 }}
        >
          <LoteCard node={node} highlight={node.isCurrent} />
        </div>
      ))}

      {/* Section labels */}
      {tree.parents.length > 0 && (
        <div
          className="absolute left-0 flex items-center gap-1.5"
          style={{ top: -4 }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border">
            ▲ Ascendência
          </span>
        </div>
      )}
      {tree.children.length > 0 && (
        <div
          className="absolute left-0 flex items-center gap-1.5"
          style={{ top: (collectAncestorRows(tree).length + 1) * (CARD_H + GAP_Y) - 18 }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-card px-2 py-0.5 rounded-full border border-border">
            ▼ Descendência
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Card component ───

const estadoColor: Record<string, string> = {
  pendente: "border-accent/40",
  em_processo: "border-primary/30",
  aprovado: "border-secondary/40",
  reprovado: "border-destructive/30",
  exportado: "border-primary/40",
  consumido: "border-border",
};

const tipoIcon: Record<string, React.ElementType> = {
  cereja: Coffee,
  cafe_verde: Package,
  parchment: Package,
  torrado: Coffee,
  moido: Coffee,
};

const LoteCard = ({ node, highlight }: { node: TreeNode; highlight?: boolean }) => {
  const { lote } = node;
  const Icon = tipoIcon[lote.tipo] || Coffee;
  const isBlend = lote.tipo_transformacao === "blend";
  const isSplit = lote.tipo_transformacao === "split";
  const TransformIcon = isBlend ? GitMerge : isSplit ? GitBranch : null;

  return (
    <Link
      to={`/lotes/${lote.id}`}
      className={cn(
        "ripple-container group flex flex-col justify-between h-full rounded-xl border-2 p-2.5 transition-all duration-200 hover:shadow-md",
        highlight
          ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
          : cn("bg-card hover:border-primary/40", estadoColor[lote.estado || "pendente"])
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          "h-6 w-6 rounded-lg flex items-center justify-center shrink-0",
          highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-3 w-3" />
        </div>
        <p className={cn("text-[11px] font-bold truncate flex-1", highlight && "text-primary")}>
          {lote.referencia_lote}
        </p>
        {highlight && (
          <Badge variant="outline" className="text-[8px] px-1 py-0 border-primary/30 text-primary shrink-0 leading-tight">
            ACTUAL
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] mt-1">
        <span className="text-muted-foreground capitalize">{lote.tipo.replace("_", " ")}</span>
        <span className="font-semibold">{lote.volume_kg} kg</span>
      </div>

      <div className="flex items-center gap-1 mt-1">
        <Badge variant="outline" className="text-[8px] px-1 py-0 capitalize leading-tight">
          {(lote.estado || "pendente").replace("_", " ")}
        </Badge>
        {TransformIcon && (
          <TransformIcon className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
    </Link>
  );
};

export default LoteGenealogy;
