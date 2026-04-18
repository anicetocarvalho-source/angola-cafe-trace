CREATE OR REPLACE FUNCTION public.get_data_integrity_report()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin_inca'::app_role) OR public.has_role(auth.uid(), 'tecnico_inca'::app_role)) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT jsonb_build_object(
    'counts', jsonb_build_object(
      'lotes', (SELECT COUNT(*) FROM lotes),
      'exploracoes', (SELECT COUNT(*) FROM exploracoes),
      'parcelas', (SELECT COUNT(*) FROM parcelas),
      'colheitas', (SELECT COUNT(*) FROM colheitas),
      'entities', (SELECT COUNT(*) FROM entities),
      'profiles', (SELECT COUNT(*) FROM profiles),
      'visitas_tecnicas', (SELECT COUNT(*) FROM visitas_tecnicas),
      'acoes_controlo', (SELECT COUNT(*) FROM acoes_controlo),
      'checklists', (SELECT COUNT(*) FROM checklists),
      'secagens', (SELECT COUNT(*) FROM secagens),
      'torras', (SELECT COUNT(*) FROM torras),
      'embalagens', (SELECT COUNT(*) FROM embalagens),
      'armazenamento', (SELECT COUNT(*) FROM armazenamento),
      'logistica', (SELECT COUNT(*) FROM logistica),
      'comercializacao', (SELECT COUNT(*) FROM comercializacao),
      'exportacoes', (SELECT COUNT(*) FROM exportacoes),
      'transformacoes', (SELECT COUNT(*) FROM transformacoes),
      'qualidade_certificacoes', (SELECT COUNT(*) FROM qualidade_certificacoes),
      'manutencao_agricola', (SELECT COUNT(*) FROM manutencao_agricola),
      'iot_leituras', (SELECT COUNT(*) FROM iot_leituras),
      'audit_logs', (SELECT COUNT(*) FROM audit_logs)
    ),
    'orphans', jsonb_build_object(
      'parcelas_sem_exploracao', (SELECT COUNT(*) FROM parcelas p WHERE NOT EXISTS (SELECT 1 FROM exploracoes e WHERE e.id = p.exploracao_id)),
      'colheitas_sem_parcela', (SELECT COUNT(*) FROM colheitas c WHERE NOT EXISTS (SELECT 1 FROM parcelas p WHERE p.id = c.parcela_id)),
      'lotes_sem_colheita', (SELECT COUNT(*) FROM lotes l WHERE l.colheita_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM colheitas c WHERE c.id = l.colheita_id)),
      'exploracoes_sem_produtor', (SELECT COUNT(*) FROM exploracoes e WHERE NOT EXISTS (SELECT 1 FROM entities ent WHERE ent.id = e.produtor_id)),
      'visitas_sem_exploracao', (SELECT COUNT(*) FROM visitas_tecnicas v WHERE NOT EXISTS (SELECT 1 FROM exploracoes e WHERE e.id = v.exploracao_id)),
      'acoes_sem_visita', (SELECT COUNT(*) FROM acoes_controlo a WHERE NOT EXISTS (SELECT 1 FROM visitas_tecnicas v WHERE v.id = a.visita_id)),
      'secagens_sem_lote', (SELECT COUNT(*) FROM secagens s WHERE NOT EXISTS (SELECT 1 FROM lotes l WHERE l.id = s.lote_id)),
      'torras_sem_lote', (SELECT COUNT(*) FROM torras t WHERE NOT EXISTS (SELECT 1 FROM lotes l WHERE l.id = t.lote_id)),
      'embalagens_sem_lote', (SELECT COUNT(*) FROM embalagens e WHERE NOT EXISTS (SELECT 1 FROM lotes l WHERE l.id = e.lote_id)),
      'armazenamento_sem_lote', (SELECT COUNT(*) FROM armazenamento a WHERE NOT EXISTS (SELECT 1 FROM lotes l WHERE l.id = a.lote_id)),
      'logistica_sem_lote', (SELECT COUNT(*) FROM logistica lo WHERE NOT EXISTS (SELECT 1 FROM lotes l WHERE l.id = lo.lote_id)),
      'comercializacao_sem_lote', (SELECT COUNT(*) FROM comercializacao c WHERE NOT EXISTS (SELECT 1 FROM lotes l WHERE l.id = c.lote_id)),
      'transformacoes_sem_lote', (SELECT COUNT(*) FROM transformacoes t WHERE NOT EXISTS (SELECT 1 FROM lotes l WHERE l.id = t.lote_id)),
      'manutencao_sem_parcela', (SELECT COUNT(*) FROM manutencao_agricola m WHERE NOT EXISTS (SELECT 1 FROM parcelas p WHERE p.id = m.parcela_id)),
      'checklists_sem_lote', (SELECT COUNT(*) FROM checklists c WHERE NOT EXISTS (SELECT 1 FROM lotes l WHERE l.id = c.lote_id)),
      'qualidade_sem_lote', (SELECT COUNT(*) FROM qualidade_certificacoes q WHERE NOT EXISTS (SELECT 1 FROM lotes l WHERE l.id = q.lote_id)),
      'profiles_sem_entidade', (SELECT COUNT(*) FROM profiles p WHERE p.entidade_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM entities e WHERE e.id = p.entidade_id))
    ),
    'generated_at', now()
  ) INTO result;

  RETURN result;
END;
$$;