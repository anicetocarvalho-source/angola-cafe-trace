-- Transformação table
CREATE TABLE public.transformacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  etapa TEXT NOT NULL CHECK (etapa IN ('despolpa', 'moagem', 'torra', 'classificacao')),
  parametros_json JSONB,
  responsavel_id UUID REFERENCES auth.users(id),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  resultado_lote_id UUID REFERENCES public.lotes(id),
  rendimento_percent DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quality & Certification table
CREATE TABLE public.qualidade_certificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('fisico', 'sensorial', 'quimico', 'residuos')),
  laboratorio TEXT,
  parametros JSONB,
  resultado TEXT CHECK (resultado IN ('aprovado', 'reprovado')),
  certificacoes_emitidas TEXT[] DEFAULT '{}',
  certificado_pdf_url TEXT,
  validade_ate DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Logistics/Transport table
CREATE TABLE public.logistica (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  transportador_id UUID REFERENCES public.entities(id),
  rota TEXT,
  veiculo TEXT,
  temp_media_c DECIMAL(5,2),
  humidade_media_percent DECIMAL(5,2),
  checkpoints JSONB DEFAULT '[]',
  documentos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commercialization table
CREATE TABLE public.comercializacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  comprador_id UUID REFERENCES public.entities(id),
  contrato_ref TEXT,
  preco_unitario DECIMAL(10,2),
  moeda TEXT CHECK (moeda IN ('AKZ', 'USD', 'EUR')),
  quantidade_kg DECIMAL(10,2),
  incoterm TEXT,
  data_contrato DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Export table
CREATE TABLE public.exportacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exportador_id UUID NOT NULL REFERENCES public.entities(id),
  lote_ids UUID[] NOT NULL,
  porto TEXT CHECK (porto IN ('Luanda', 'Lobito', 'Namibe', 'Cabinda')),
  navio TEXT,
  booking TEXT,
  bl_ref TEXT,
  du_ref TEXT,
  pais_destino TEXT,
  data_embarque DATE,
  packing_list_url TEXT,
  invoice_url TEXT,
  certificado_origem_url TEXT,
  eudr_pacote_id TEXT,
  status TEXT DEFAULT 'preparacao' CHECK (status IN ('preparacao', 'submetido', 'autorizado', 'embarcado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SIM (Market Information System) table
CREATE TABLE public.sim_mercado (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fonte TEXT NOT NULL,
  indicador TEXT NOT NULL CHECK (indicador IN ('preco_spot', 'preco_futuro', 'estoque', 'consumo', 'exportacao', 'producao')),
  localizacao TEXT,
  unidade TEXT,
  valor DECIMAL(12,2),
  data_referencia DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit table
CREATE TABLE public.auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidade TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  acao TEXT NOT NULL CHECK (acao IN ('create', 'update', 'delete', 'transition')),
  by_user_id UUID REFERENCES auth.users(id),
  by_ip TEXT,
  diff_json JSONB,
  hash TEXT,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IoT readings table
CREATE TABLE public.iot_leituras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispositivo_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('temp', 'hum', 'solo', 'outro')),
  valor_decimal DECIMAL(10,4),
  unidade TEXT,
  data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  lote_id UUID REFERENCES public.lotes(id),
  secagem_id UUID REFERENCES public.secagens(id),
  assinatura TEXT,
  origem_fabricante TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.transformacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualidade_certificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comercializacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exportacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_mercado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_leituras ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transformacoes
CREATE POLICY "Authenticated users can view transformacoes"
  ON public.transformacoes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can create transformacoes"
  ON public.transformacoes FOR INSERT
  TO authenticated WITH CHECK (true);

-- RLS Policies for qualidade_certificacoes
CREATE POLICY "Authenticated users can view quality certs"
  ON public.qualidade_certificacoes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Technicians can manage quality certs"
  ON public.qualidade_certificacoes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'tecnico_inca') OR public.has_role(auth.uid(), 'admin_inca'));

-- RLS Policies for logistica
CREATE POLICY "Authenticated users can view logistics"
  ON public.logistica FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Transporters can create logistics"
  ON public.logistica FOR INSERT
  TO authenticated WITH CHECK (true);

-- RLS Policies for comercializacao
CREATE POLICY "Authenticated users can view sales"
  ON public.comercializacao FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can create sales"
  ON public.comercializacao FOR INSERT
  TO authenticated WITH CHECK (true);

-- RLS Policies for exportacoes
CREATE POLICY "Authenticated users can view exports"
  ON public.exportacoes FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Exporters can manage exports"
  ON public.exportacoes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'exportador') OR public.has_role(auth.uid(), 'admin_inca'));

-- RLS Policies for sim_mercado (public read)
CREATE POLICY "Public can view market data"
  ON public.sim_mercado FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage market data"
  ON public.sim_mercado FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin_inca'));

-- RLS Policies for auditoria (admin only)
CREATE POLICY "Admins can view audit logs"
  ON public.auditoria FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin_inca'));

-- RLS Policies for iot_leituras
CREATE POLICY "Authenticated users can view IoT readings"
  ON public.iot_leituras FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "System can insert IoT readings"
  ON public.iot_leituras FOR INSERT
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER set_updated_at_transformacoes
  BEFORE UPDATE ON public.transformacoes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_qualidade
  BEFORE UPDATE ON public.qualidade_certificacoes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_logistica
  BEFORE UPDATE ON public.logistica
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_comercializacao
  BEFORE UPDATE ON public.comercializacao
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_exportacoes
  BEFORE UPDATE ON public.exportacoes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample SIM data
INSERT INTO public.sim_mercado (fonte, indicador, localizacao, unidade, valor, data_referencia) VALUES
('ICE', 'preco_spot', 'Internacional', 'USD/kg', 4.85, CURRENT_DATE),
('INCA', 'preco_spot', 'Nacional', 'AKZ/kg', 4250, CURRENT_DATE),
('INCA', 'producao', 'Nacional', 'Toneladas', 28000, CURRENT_DATE),
('INCA', 'exportacao', 'Nacional', 'Toneladas', 12450, CURRENT_DATE),
('ICE', 'preco_futuro', 'Internacional', 'USD/kg', 5.10, CURRENT_DATE);