import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcaoControlo {
  id: string;
  visita_id: string;
  tipo: string;
  descricao: string;
  prazo: string;
  responsavel: string | null;
  estado: string;
}

interface VisitaTecnica {
  id: string;
  tecnico_id: string;
  exploracao_id: string;
  exploracoes: {
    designacao: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate dates for notifications
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    const oneDayStr = oneDayFromNow.toISOString().split('T')[0];

    console.log(`Checking deadlines: today=${todayStr}, 1day=${oneDayStr}, 3days=${threeDaysStr}`);

    // Get pending/in-progress actions with deadlines
    const { data: acoes, error: acoesError } = await supabaseAdmin
      .from('acoes_controlo')
      .select(`
        id,
        visita_id,
        tipo,
        descricao,
        prazo,
        responsavel,
        estado
      `)
      .in('estado', ['pendente', 'em_curso'])
      .not('prazo', 'is', null)
      .lte('prazo', threeDaysStr);

    if (acoesError) {
      console.error("Error fetching actions:", acoesError);
      throw acoesError;
    }

    console.log(`Found ${acoes?.length || 0} actions with approaching deadlines`);

    if (!acoes || acoes.length === 0) {
      return new Response(
        JSON.stringify({ message: "No actions with approaching deadlines", notificationsCreated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get visit details for each action
    const visitaIds = [...new Set(acoes.map(a => a.visita_id))];
    const { data: visitas, error: visitasError } = await supabaseAdmin
      .from('visitas_tecnicas')
      .select(`
        id,
        tecnico_id,
        exploracao_id,
        exploracoes (
          designacao
        )
      `)
      .in('id', visitaIds);

    if (visitasError) {
      console.error("Error fetching visits:", visitasError);
      throw visitasError;
    }

    const visitaMap = new Map(visitas?.map(v => [v.id, v]) || []);

    // Get all admin_inca and tecnico_inca users for notifications
    const { data: incaUsers, error: usersError } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['admin_inca', 'tecnico_inca']);

    if (usersError) {
      console.error("Error fetching INCA users:", usersError);
      throw usersError;
    }

    const notifications: {
      user_id: string;
      title: string;
      message: string;
      type: string;
      link: string;
    }[] = [];

    for (const acao of acoes) {
      const visita = visitaMap.get(acao.visita_id) as VisitaTecnica | undefined;
      if (!visita) continue;

      const prazoDate = new Date(acao.prazo);
      const diffDays = Math.ceil((prazoDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let notificationType: string;
      let title: string;
      let urgency: string;

      if (diffDays < 0) {
        notificationType = 'error';
        title = '⚠️ Prazo Ultrapassado';
        urgency = `Atrasado ${Math.abs(diffDays)} dia(s)`;
      } else if (diffDays === 0) {
        notificationType = 'warning';
        title = '🔔 Prazo Hoje';
        urgency = 'Prazo termina hoje';
      } else if (diffDays === 1) {
        notificationType = 'warning';
        title = '⏰ Prazo Amanhã';
        urgency = 'Prazo termina amanhã';
      } else {
        notificationType = 'info';
        title = '📅 Prazo Aproxima-se';
        urgency = `Faltam ${diffDays} dias`;
      }

      const exploracaoNome = (visita.exploracoes as any)?.designacao || 'Exploração';
      const message = `${urgency}: "${acao.descricao.substring(0, 50)}${acao.descricao.length > 50 ? '...' : ''}" - ${exploracaoNome}`;
      const link = `/fiscalizacao/${acao.visita_id}`;

      // Check if notification already exists today for this action
      const todayStart = new Date(today);
      todayStart.setHours(0, 0, 0, 0);
      
      // Notify the technician responsible for the visit
      const { data: existingNotif } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', visita.tecnico_id)
        .eq('link', link)
        .gte('created_at', todayStart.toISOString())
        .limit(1);

      if (!existingNotif || existingNotif.length === 0) {
        notifications.push({
          user_id: visita.tecnico_id,
          title,
          message,
          type: notificationType,
          link,
        });
      }

      // Also notify all admin_inca users for overdue actions
      if (diffDays < 0) {
        for (const user of incaUsers || []) {
          if (user.role === 'admin_inca' && user.user_id !== visita.tecnico_id) {
            const { data: existingAdminNotif } = await supabaseAdmin
              .from('notifications')
              .select('id')
              .eq('user_id', user.user_id)
              .eq('link', link)
              .gte('created_at', todayStart.toISOString())
              .limit(1);

            if (!existingAdminNotif || existingAdminNotif.length === 0) {
              notifications.push({
                user_id: user.user_id,
                title: '⚠️ Ação Atrasada',
                message: `Ação de controlo atrasada: "${acao.descricao.substring(0, 50)}${acao.descricao.length > 50 ? '...' : ''}"`,
                type: 'error',
                link,
              });
            }
          }
        }
      }
    }

    console.log(`Creating ${notifications.length} notifications`);

    // Insert notifications
    if (notifications.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
        throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Deadline check completed",
        actionsChecked: acoes.length,
        notificationsCreated: notifications.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in check-action-deadlines:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
