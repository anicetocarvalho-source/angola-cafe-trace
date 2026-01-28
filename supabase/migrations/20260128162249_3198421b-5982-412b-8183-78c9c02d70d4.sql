-- Create function for updating timestamps if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create agricultural maintenance table
CREATE TABLE public.manutencao_agricola (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  data_execucao DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('tratamento', 'fertilizacao', 'poda', 'capina', 'irrigacao', 'outro')),
  descricao TEXT,
  produtos_utilizados TEXT[],
  quantidade_produto NUMERIC,
  unidade_produto TEXT,
  area_aplicada_ha NUMERIC,
  responsavel TEXT,
  custo_estimado NUMERIC,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.manutencao_agricola ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view maintenance records for their parcels
CREATE POLICY "Users can view related manutencao" 
ON public.manutencao_agricola 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin_inca'::app_role) OR 
  has_role(auth.uid(), 'tecnico_inca'::app_role) OR 
  EXISTS (
    SELECT 1 FROM parcelas p
    JOIN exploracoes e ON e.id = p.exploracao_id
    JOIN profiles pr ON pr.entidade_id = e.produtor_id
    WHERE pr.id = auth.uid() AND p.id = manutencao_agricola.parcela_id
  )
);

-- Policy: Users can manage maintenance records for their parcels
CREATE POLICY "Users can manage related manutencao" 
ON public.manutencao_agricola 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM parcelas p
    JOIN exploracoes e ON e.id = p.exploracao_id
    JOIN profiles pr ON pr.entidade_id = e.produtor_id
    WHERE pr.id = auth.uid() AND p.id = manutencao_agricola.parcela_id
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_manutencao_agricola_updated_at
BEFORE UPDATE ON public.manutencao_agricola
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();