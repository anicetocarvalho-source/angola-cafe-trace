
-- Create armazenamento table for warehouse/storage management
CREATE TABLE public.armazenamento (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id uuid NOT NULL REFERENCES public.lotes(id),
  armazem_nome text NOT NULL,
  tipo_movimento text NOT NULL CHECK (tipo_movimento IN ('entrada', 'saida')),
  quantidade_kg numeric NOT NULL,
  data_movimento date NOT NULL DEFAULT CURRENT_DATE,
  temperatura_c numeric,
  humidade_percent numeric,
  localizacao_armazem text,
  responsavel text,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.armazenamento ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view storage" ON public.armazenamento
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create storage records" ON public.armazenamento
  FOR INSERT TO authenticated WITH CHECK (true);

-- Updated_at trigger
CREATE TRIGGER update_armazenamento_updated_at
  BEFORE UPDATE ON public.armazenamento
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
