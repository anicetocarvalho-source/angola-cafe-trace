import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, GitBranch, GitMerge, Package, ArrowDown, Loader2 } from "lucide-react";
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
  depth: number;
  isCurrent: boolean;
}

interface LoteGenealogyProps {
  loteId: string;
}

const MAX_DEPTH = 5;

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
    const node: TreeNode = { lote, parents: [], children: [], depth, isCurrent };
    if (depth >= MAX_DEPTH) return node;
    fetchedIds.add(lote.id);

    const parentIds = (lote.parent_lote_ids || []).filter(id => id && !fetchedIds.has(id));
    if (parentIds.length > 0) {
      const parentPromises = parentIds.map(async (pid) => {
        const parentLote = await fetchLote(pid);
        if (!parentLote) return null;
        return buildAncestors(parentLote, depth + 1, false);
      });
      const parents = await Promise.all(parentPromises);
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
      const childNode: TreeNode = { lote: child, parents: [], children: [], depth: depth + 1, isCurrent: false };
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

  const hasAncestors = tree.parents.length > 0;
  const hasDescendants = tree.children.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          Genealogia do Lote
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAncestors && !hasDescendants ? (
          <p className="text-muted-foreground text-center py-4">
            Este lote não tem ascendentes nem descendentes registados.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-2 overflow-x-auto py-4">
            {/* Ancestors section */}
            {hasAncestors && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Ascendência</p>
                <AncestorLevel nodes={tree.parents} />
                <ConnectorArrow label={tree.lote.tipo_transformacao === "blend" ? "Blend" : tree.lote.tipo_transformacao === "split" ? "Divisão" : "Origem"} />
              </>
            )}

            {/* Current node */}
            <LoteCard node={tree} highlight />

            {/* Descendants section */}
            {hasDescendants && (
              <>
                <ConnectorArrow label={tree.children.length > 1 ? "Divisão" : "Derivado"} />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Descendência</p>
                <DescendantLevel nodes={tree.children} />
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AncestorLevel = ({ nodes }: { nodes: TreeNode[] }) => (
  <div className="flex flex-col items-center gap-2">
    {/* Recurse for grandparents */}
    {nodes.some(n => n.parents.length > 0) && (
      <>
        <div className="flex flex-wrap justify-center gap-4">
          {nodes.map(n => n.parents.length > 0 && (
            <div key={n.lote.id + "-gp"} className="flex flex-col items-center gap-2">
              <AncestorLevel nodes={n.parents} />
              <ConnectorArrow small />
            </div>
          ))}
        </div>
      </>
    )}
    <div className="flex flex-wrap justify-center gap-4">
      {nodes.map(n => (
        <LoteCard key={n.lote.id} node={n} />
      ))}
    </div>
  </div>
);

const DescendantLevel = ({ nodes }: { nodes: TreeNode[] }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="flex flex-wrap justify-center gap-4">
      {nodes.map(n => (
        <LoteCard key={n.lote.id} node={n} />
      ))}
    </div>
    {/* Recurse for grandchildren */}
    {nodes.some(n => n.children.length > 0) && (
      <>
        {nodes.map(n => n.children.length > 0 && (
          <div key={n.lote.id + "-gc"} className="flex flex-col items-center gap-2 mt-2">
            <ConnectorArrow small />
            <DescendantLevel nodes={n.children} />
          </div>
        ))}
      </>
    )}
  </div>
);

const ConnectorArrow = ({ label, small }: { label?: string; small?: boolean }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className={cn("w-px bg-border", small ? "h-4" : "h-6")} />
    {label && (
      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
        {label}
      </span>
    )}
    <ArrowDown className={cn("text-muted-foreground", small ? "h-3 w-3" : "h-4 w-4")} />
  </div>
);

const estadoColor: Record<string, string> = {
  pendente: "bg-accent/20 text-accent-foreground border-accent/40",
  em_processo: "bg-primary/10 text-primary border-primary/30",
  aprovado: "bg-secondary/20 text-secondary border-secondary/40",
  reprovado: "bg-destructive/10 text-destructive border-destructive/30",
  exportado: "bg-primary/20 text-primary border-primary/40",
  consumido: "bg-muted text-muted-foreground border-border",
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
        "ripple-container group block rounded-xl border-2 p-3 min-w-[180px] max-w-[220px] transition-all duration-200",
        highlight
          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
          : "border-border bg-card hover:border-primary/40 hover:shadow-sm",
        estadoColor[lote.estado || "pendente"]
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className={cn(
          "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
          highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-bold truncate", highlight && "text-primary")}>
            {lote.referencia_lote}
          </p>
        </div>
        {highlight && (
          <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/30 text-primary shrink-0">
            ACTUAL
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground capitalize">{lote.tipo.replace("_", " ")}</span>
        <span className="font-semibold">{lote.volume_kg} kg</span>
      </div>

      <div className="flex items-center gap-1 mt-1.5">
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize">
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
