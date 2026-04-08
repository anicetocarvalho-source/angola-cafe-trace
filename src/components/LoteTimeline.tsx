import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sprout, Coffee, Sun, FlaskConical, Warehouse, Truck, Ship, Award, Package, GitBranch, GitMerge } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  icon: React.ElementType;
  status?: string;
  parentLoteIds?: { id: string; ref: string }[];
}

interface LoteTimelineProps {
  loteId: string;
}

const LoteTimeline = ({ loteId }: LoteTimelineProps) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelineData();
  }, [loteId]);

  const fetchTimelineData = async () => {
    try {
      const [
        { data: lote },
        { data: secagens },
        { data: transformacoes },
        { data: armazenamentos },
        { data: logisticas },
        { data: qualidades },
        { data: torras },
        { data: embalagens },
      ] = await Promise.all([
        supabase.from("lotes").select("*, colheitas(*, parcelas(codigo_parcela, exploracoes(designacao)))").eq("id", loteId).single(),
        supabase.from("secagens").select("*").eq("lote_id", loteId).order("data_inicio"),
        supabase.from("transformacoes").select("*").eq("lote_id", loteId).order("data"),
        supabase.from("armazenamento").select("*").eq("lote_id", loteId).order("data_movimento"),
        supabase.from("logistica").select("*").eq("lote_id", loteId).order("created_at"),
        supabase.from("qualidade_certificacoes").select("*").eq("lote_id", loteId).order("created_at"),
        supabase.from("torras").select("*").eq("lote_id", loteId).order("data_torra"),
        supabase.from("embalagens").select("*").eq("lote_id", loteId).order("data_embalagem"),
      ]);

      const timeline: TimelineEvent[] = [];

      // Genealogia — Divisão ou Blend
      if (lote?.tipo_transformacao && lote?.parent_lote_ids?.length > 0) {
        const { data: parentLotes } = await supabase
          .from("lotes")
          .select("id, referencia_lote")
          .in("id", lote.parent_lote_ids);

        const parentNames = parentLotes?.map((p: any) => p.referencia_lote).join(", ") || "N/D";
        const isDivisao = lote.tipo_transformacao === "divisao";

        timeline.push({
          id: `genealogia-${lote.id}`,
          type: "genealogia",
          title: isDivisao ? "Origem: Divisão de Lote" : "Origem: Blend/Agregação",
          description: `Lotes de origem: ${parentNames}`,
          date: lote.created_at,
          icon: isDivisao ? GitBranch : GitMerge,
          status: lote.tipo_transformacao,
          parentLoteIds: parentLotes?.map((p: any) => ({ id: p.id, ref: p.referencia_lote })),
        });
      }

      // Colheita
      if (lote?.colheitas) {
        const c = lote.colheitas as any;
        timeline.push({
          id: `colheita-${lote.id}`,
          type: "colheita",
          title: "Colheita",
          description: `Campanha ${c.campanha} — ${c.parcelas?.exploracoes?.designacao || ""} (${c.parcelas?.codigo_parcela || ""})`,
          date: c.data_inicio,
          icon: Sprout,
          status: "concluído",
        });
      }

      // Secagens
      secagens?.forEach((s, i) => {
        timeline.push({
          id: `secagem-${s.id}`,
          type: "secagem",
          title: `Secagem ${secagens.length > 1 ? i + 1 : ""}`.trim(),
          description: `${s.metodo}${s.humidade_final_percent ? ` — Humidade final: ${s.humidade_final_percent}%` : ""}`,
          date: s.data_inicio,
          icon: Sun,
          status: s.data_fim ? "concluído" : "em curso",
        });
      });

      // Transformações
      transformacoes?.forEach((t) => {
        timeline.push({
          id: `transf-${t.id}`,
          type: "transformacao",
          title: `Transformação: ${t.etapa}`,
          description: t.rendimento_percent ? `Rendimento: ${t.rendimento_percent}%` : "Sem rendimento registado",
          date: t.data,
          icon: FlaskConical,
        });
      });

      // Torras
      torras?.forEach((t) => {
        timeline.push({
          id: `torra-${t.id}`,
          type: "torra",
          title: `Torra: ${t.perfil_torra}`,
          description: `${t.temperatura_max_c ? `Temp. máx: ${t.temperatura_max_c}°C` : ""}${t.perda_peso_percent ? ` — Perda: ${t.perda_peso_percent}%` : ""}`.trim() || "Sem detalhes",
          date: t.data_torra,
          icon: Coffee,
        });
      });

      // Armazenamento
      armazenamentos?.forEach((a) => {
        timeline.push({
          id: `armaz-${a.id}`,
          type: "armazenamento",
          title: `${a.tipo_movimento === "entrada" ? "Entrada" : "Saída"}: ${a.armazem_nome}`,
          description: `${a.quantidade_kg} kg${a.temperatura_c ? ` — ${a.temperatura_c}°C` : ""}`,
          date: a.data_movimento,
          icon: Warehouse,
        });
      });

      // Logística
      logisticas?.forEach((l) => {
        timeline.push({
          id: `log-${l.id}`,
          type: "logistica",
          title: `Transporte${l.rota ? `: ${l.rota}` : ""}`,
          description: `${l.veiculo || ""}${l.temp_media_c ? ` — Temp: ${l.temp_media_c}°C` : ""}`.trim() || "Sem detalhes",
          date: l.created_at,
          icon: Truck,
        });
      });

      // Embalagens
      embalagens?.forEach((e) => {
        timeline.push({
          id: `emb-${e.id}`,
          type: "embalagem",
          title: `Embalagem: ${e.tipo_embalagem}`,
          description: `${e.peso_kg} kg${e.codigo_lote_final ? ` — Código: ${e.codigo_lote_final}` : ""}`,
          date: e.data_embalagem,
          icon: Package,
        });
      });

      // Qualidade
      qualidades?.forEach((q) => {
        timeline.push({
          id: `qual-${q.id}`,
          type: "qualidade",
          title: `Análise: ${q.tipo}`,
          description: `Resultado: ${q.resultado || "pendente"}${q.laboratorio ? ` — Lab: ${q.laboratorio}` : ""}`,
          date: q.created_at,
          icon: Award,
          status: q.resultado || undefined,
        });
      });

      // Exportação check
      const { data: exportacoes } = await supabase.from("exportacoes").select("*");
      exportacoes?.forEach((exp) => {
        if (exp.lote_ids?.includes(loteId)) {
          timeline.push({
            id: `exp-${exp.id}`,
            type: "exportacao",
            title: `Exportação: ${exp.pais_destino || "Destino N/D"}`,
            description: `${exp.porto ? `Porto: ${exp.porto}` : ""}${exp.navio ? ` — Navio: ${exp.navio}` : ""}`.trim() || exp.status || "",
            date: exp.data_embarque || exp.created_at,
            icon: Ship,
            status: exp.status || undefined,
          });
        }
      });

      // Sort by date
      timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(timeline);
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const typeColors: Record<string, string> = {
    colheita: "bg-green-500",
    secagem: "bg-amber-500",
    transformacao: "bg-purple-500",
    torra: "bg-orange-600",
    armazenamento: "bg-blue-500",
    logistica: "bg-cyan-500",
    embalagem: "bg-pink-500",
    qualidade: "bg-emerald-500",
    exportacao: "bg-indigo-500",
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">A carregar timeline...</div>;
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Sem eventos registados para este lote.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linha do Tempo do Lote</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-6">
            {events.map((event, idx) => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="relative flex gap-4 items-start">
                  <div className={cn("relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-white shrink-0", typeColors[event.type] || "bg-muted-foreground")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{event.title}</p>
                      {event.status && (
                        <Badge variant="outline" className="text-xs">{event.status}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoteTimeline;
