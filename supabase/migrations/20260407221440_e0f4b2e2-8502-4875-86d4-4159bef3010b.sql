
-- Phase 1: Lot Genealogy - add parent tracking to lotes
ALTER TABLE public.lotes
ADD COLUMN IF NOT EXISTS parent_lote_ids uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tipo_transformacao text;

-- Phase 2: Checklists / PCC
CREATE TABLE public.checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id uuid NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  etapa text NOT NULL,
  tecnico_id uuid NOT NULL,
  data_verificacao timestamptz NOT NULL DEFAULT now(),
  itens jsonb NOT NULL DEFAULT '[]',
  resultado text NOT NULL DEFAULT 'pendente',
  observacoes text,
  limites_pcc jsonb DEFAULT '{}',
  alertas_gerados boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians can manage checklists"
ON public.checklists FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'tecnico_inca'::app_role) OR has_role(auth.uid(), 'admin_inca'::app_role));

CREATE POLICY "Authenticated users can view checklists"
ON public.checklists FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER update_checklists_updated_at
BEFORE UPDATE ON public.checklists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 3a: Torras (Roasting)
CREATE TABLE public.torras (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id uuid NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  perfil_torra text NOT NULL,
  temperatura_max_c numeric,
  tempo_total_min numeric,
  perda_peso_percent numeric,
  curva_json jsonb DEFAULT '[]',
  data_torra date NOT NULL DEFAULT CURRENT_DATE,
  responsavel_id uuid,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.torras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Processadores can manage torras"
ON public.torras FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'processador'::app_role) OR has_role(auth.uid(), 'admin_inca'::app_role) OR has_role(auth.uid(), 'tecnico_inca'::app_role));

CREATE POLICY "Authenticated users can view torras"
ON public.torras FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER update_torras_updated_at
BEFORE UPDATE ON public.torras
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 3b: Embalagens (Packaging)
CREATE TABLE public.embalagens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id uuid NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  tipo_embalagem text NOT NULL,
  peso_kg numeric NOT NULL,
  data_embalagem date NOT NULL DEFAULT CURRENT_DATE,
  validade date,
  codigo_lote_final text,
  responsavel_id uuid,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.embalagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Processadores can manage embalagens"
ON public.embalagens FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'processador'::app_role) OR has_role(auth.uid(), 'admin_inca'::app_role) OR has_role(auth.uid(), 'tecnico_inca'::app_role));

CREATE POLICY "Authenticated users can view embalagens"
ON public.embalagens FOR SELECT
TO authenticated
USING (true);

CREATE TRIGGER update_embalagens_updated_at
BEFORE UPDATE ON public.embalagens
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
