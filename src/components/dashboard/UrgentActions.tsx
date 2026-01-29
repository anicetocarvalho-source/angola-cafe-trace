import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { format, differenceInDays, isPast, isToday } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";

type ActionStatus = "pendente" | "em_curso" | "concluida" | "nao_cumprida";

interface ControlAction {
  id: string;
  tipo: string;
  descricao: string;
  prazo: string | null;
  estado: ActionStatus;
  visita_id: string;
}

export const UrgentActions = () => {
  const { data: actions, isLoading } = useQuery({
    queryKey: ["urgent-actions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acoes_controlo")
        .select("id, tipo, descricao, prazo, estado, visita_id")
        .in("estado", ["pendente", "em_curso"])
        .not("prazo", "is", null)
        .order("prazo", { ascending: true })
        .limit(10);
      if (error) throw error;
      return data as ControlAction[];
    },
  });

  const getUrgencyLevel = (prazo: string) => {
    const deadline = new Date(prazo);
    if (isPast(deadline) && !isToday(deadline)) return "overdue";
    if (isToday(deadline)) return "today";
    const daysUntil = differenceInDays(deadline, new Date());
    if (daysUntil <= 3) return "urgent";
    return "normal";
  };

  const getUrgencyBadge = (prazo: string) => {
    const level = getUrgencyLevel(prazo);
    switch (level) {
      case "overdue":
        return <Badge variant="destructive">Vencida</Badge>;
      case "today":
        return <Badge className="bg-accent text-accent-foreground">Hoje</Badge>;
      case "urgent":
        return <Badge className="bg-accent/80 text-accent-foreground">Urgente</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getStatusIcon = (estado: ActionStatus) => {
    switch (estado) {
      case "em_curso":
        return <Clock className="h-4 w-4 text-accent" />;
      case "concluida":
        return <CheckCircle2 className="h-4 w-4 text-secondary" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Filter and sort by urgency
  const sortedActions = actions?.sort((a, b) => {
    if (!a.prazo || !b.prazo) return 0;
    const aLevel = getUrgencyLevel(a.prazo);
    const bLevel = getUrgencyLevel(b.prazo);
    const priority = { overdue: 0, today: 1, urgent: 2, normal: 3 };
    return priority[aLevel] - priority[bLevel];
  }).slice(0, 5);

  const overdueCount = actions?.filter(a => a.prazo && getUrgencyLevel(a.prazo) === "overdue").length || 0;
  const urgentCount = actions?.filter(a => a.prazo && ["today", "urgent"].includes(getUrgencyLevel(a.prazo))).length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Ações de Controlo Urgentes
          </CardTitle>
          <CardDescription>
            Ações pendentes que requerem atenção imediata
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {overdueCount > 0 && (
            <Badge variant="destructive">{overdueCount} vencidas</Badge>
          )}
          {urgentCount > 0 && (
            <Badge className="bg-accent text-accent-foreground">{urgentCount} urgentes</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sortedActions && sortedActions.length > 0 ? (
          <div className="space-y-3">
            {sortedActions.map((action) => (
              <div
                key={action.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  action.prazo && getUrgencyLevel(action.prazo) === "overdue"
                    ? "bg-destructive/5 border-destructive/30"
                    : action.prazo && getUrgencyLevel(action.prazo) === "today"
                    ? "bg-accent/10 border-accent/30"
                    : "bg-muted/30"
                }`}
              >
                {getStatusIcon(action.estado)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{action.tipo}</p>
                    {action.prazo && getUrgencyBadge(action.prazo)}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {action.descricao}
                  </p>
                  {action.prazo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Prazo: {format(new Date(action.prazo), "dd MMM yyyy", { locale: pt })}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/fiscalizacao/visita/${action.visita_id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link to="/fiscalizacao">
                Ver Todas as Ações
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-secondary opacity-70" />
            <p className="text-sm">Nenhuma ação pendente com prazo</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UrgentActions;
