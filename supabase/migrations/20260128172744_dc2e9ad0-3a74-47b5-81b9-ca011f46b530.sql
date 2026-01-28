-- Create enum for visit types
CREATE TYPE public.visit_type AS ENUM ('rotina', 'fiscalizacao', 'acompanhamento', 'emergencia');

-- Create enum for visit status
CREATE TYPE public.visit_status AS ENUM ('agendada', 'em_curso', 'realizada', 'cancelada');

-- Create enum for action status
CREATE TYPE public.action_status AS ENUM ('pendente', 'em_curso', 'concluida', 'nao_cumprida');

-- Create table for technical visits
CREATE TABLE public.visitas_tecnicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exploracao_id UUID REFERENCES public.exploracoes(id) ON DELETE CASCADE NOT NULL,
    tecnico_id UUID NOT NULL,
    data_visita DATE NOT NULL,
    tipo visit_type NOT NULL DEFAULT 'rotina',
    objetivo TEXT,
    observacoes TEXT,
    estado visit_status NOT NULL DEFAULT 'agendada',
    conformidade_geral TEXT,
    fotos_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for control actions
CREATE TABLE public.acoes_controlo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visita_id UUID REFERENCES public.visitas_tecnicas(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    prazo DATE,
    responsavel TEXT,
    estado action_status NOT NULL DEFAULT 'pendente',
    data_conclusao DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acoes_controlo ENABLE ROW LEVEL SECURITY;

-- RLS policies for visitas_tecnicas
CREATE POLICY "Technicians can manage visits"
ON public.visitas_tecnicas
FOR ALL
USING (has_role(auth.uid(), 'tecnico_inca') OR has_role(auth.uid(), 'admin_inca'));

CREATE POLICY "Producers can view their visits"
ON public.visitas_tecnicas
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM exploracoes e
        JOIN profiles p ON p.entidade_id = e.produtor_id
        WHERE e.id = visitas_tecnicas.exploracao_id
        AND p.id = auth.uid()
    )
);

-- RLS policies for acoes_controlo
CREATE POLICY "Technicians can manage actions"
ON public.acoes_controlo
FOR ALL
USING (has_role(auth.uid(), 'tecnico_inca') OR has_role(auth.uid(), 'admin_inca'));

CREATE POLICY "Producers can view their actions"
ON public.acoes_controlo
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM visitas_tecnicas vt
        JOIN exploracoes e ON e.id = vt.exploracao_id
        JOIN profiles p ON p.entidade_id = e.produtor_id
        WHERE vt.id = acoes_controlo.visita_id
        AND p.id = auth.uid()
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_visitas_tecnicas_updated_at
    BEFORE UPDATE ON public.visitas_tecnicas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acoes_controlo_updated_at
    BEFORE UPDATE ON public.acoes_controlo
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();