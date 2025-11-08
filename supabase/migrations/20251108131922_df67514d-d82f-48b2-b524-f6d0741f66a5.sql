-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles/profiles
CREATE TYPE public.app_role AS ENUM (
  'admin_inca',
  'tecnico_inca',
  'produtor',
  'cooperativa',
  'processador',
  'transportador',
  'exportador',
  'comprador'
);

-- Create enum for entity types
CREATE TYPE public.entity_type AS ENUM (
  'produtor',
  'cooperativa',
  'processador',
  'exportador',
  'transportador',
  'institucional'
);

-- Create enum for lot types
CREATE TYPE public.lot_type AS ENUM (
  'cereja',
  'cafe_verde',
  'parchment',
  'torrado',
  'moido'
);

-- Create enum for lot status
CREATE TYPE public.lot_status AS ENUM (
  'pendente',
  'em_processo',
  'aprovado',
  'reprovado',
  'exportado',
  'consumido'
);

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telemovel TEXT,
  entidade_id UUID,
  termos_aceites_at TIMESTAMPTZ,
  ultimo_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Entities table (organizations)
CREATE TABLE public.entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo public.entity_type NOT NULL,
  nome_legal TEXT NOT NULL,
  nif TEXT UNIQUE,
  endereco TEXT,
  provincia TEXT,
  municipio TEXT,
  contacto_email TEXT,
  contacto_telefone TEXT,
  certificacoes TEXT[] DEFAULT '{}',
  eudr_compliant BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Explorations (farms)
CREATE TABLE public.exploracoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produtor_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
  designacao TEXT NOT NULL,
  area_ha DECIMAL(10,2),
  provincia TEXT NOT NULL,
  municipio TEXT NOT NULL,
  comuna TEXT,
  aldeia TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  altitude_m INTEGER,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'validado', 'indeferido')),
  validado_por UUID REFERENCES auth.users(id),
  validado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parcels (plots within farms)
CREATE TABLE public.parcelas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exploracao_id UUID NOT NULL REFERENCES public.exploracoes(id) ON DELETE CASCADE,
  codigo_parcela TEXT NOT NULL,
  area_ha DECIMAL(10,2),
  varietais TEXT[] DEFAULT '{}',
  ano_plantio INTEGER,
  praticas_agricolas TEXT[] DEFAULT '{}',
  sombra_percent INTEGER,
  irrigacao BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exploracao_id, codigo_parcela)
);

-- Harvests
CREATE TABLE public.colheitas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id) ON DELETE CASCADE,
  campanha TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  volume_cereja_kg DECIMAL(10,2),
  metodo_colheita TEXT CHECK (metodo_colheita IN ('manual', 'mecanico')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lots (main traceability unit)
CREATE TABLE public.lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referencia_lote TEXT UNIQUE NOT NULL,
  colheita_id UUID REFERENCES public.colheitas(id),
  tipo public.lot_type NOT NULL DEFAULT 'cereja',
  volume_kg DECIMAL(10,2) NOT NULL,
  humidade_percent DECIMAL(5,2),
  temperatura_c DECIMAL(5,2),
  defeitos_ppm INTEGER,
  classificacao_sensorial DECIMAL(5,2),
  qr_code TEXT UNIQUE,
  rfid_uid TEXT,
  blockchain_tx_hash TEXT,
  estado public.lot_status DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drying process
CREATE TABLE public.secagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  metodo TEXT NOT NULL CHECK (metodo IN ('terreiro', 'estufa', 'mecanica')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  tempo_total_h INTEGER,
  temp_media_c DECIMAL(5,2),
  humidade_final_percent DECIMAL(5,2),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exploracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colheitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secagens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles (read-only for users, admins can manage)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin_inca'));

-- RLS Policies for entities
CREATE POLICY "Authenticated users can view entities"
  ON public.entities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage entities"
  ON public.entities FOR ALL
  USING (public.has_role(auth.uid(), 'admin_inca'));

-- RLS Policies for exploracoes
CREATE POLICY "Users can view related exploracoes"
  ON public.exploracoes FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin_inca') OR
    public.has_role(auth.uid(), 'tecnico_inca') OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.entidade_id = exploracoes.produtor_id
    )
  );

CREATE POLICY "Producers can create own exploracoes"
  ON public.exploracoes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.entidade_id = produtor_id
    )
  );

CREATE POLICY "Producers can update own exploracoes"
  ON public.exploracoes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.entidade_id = produtor_id
    )
  );

-- RLS Policies for parcelas
CREATE POLICY "Users can view related parcelas"
  ON public.parcelas FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin_inca') OR
    public.has_role(auth.uid(), 'tecnico_inca') OR
    EXISTS (
      SELECT 1 FROM public.exploracoes e
      JOIN public.profiles p ON p.entidade_id = e.produtor_id
      WHERE p.id = auth.uid() AND e.id = parcelas.exploracao_id
    )
  );

CREATE POLICY "Users can manage related parcelas"
  ON public.parcelas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exploracoes e
      JOIN public.profiles p ON p.entidade_id = e.produtor_id
      WHERE p.id = auth.uid() AND e.id = parcelas.exploracao_id
    )
  );

-- RLS Policies for colheitas
CREATE POLICY "Users can view related colheitas"
  ON public.colheitas FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin_inca') OR
    public.has_role(auth.uid(), 'tecnico_inca') OR
    EXISTS (
      SELECT 1 FROM public.parcelas pa
      JOIN public.exploracoes e ON e.id = pa.exploracao_id
      JOIN public.profiles p ON p.entidade_id = e.produtor_id
      WHERE p.id = auth.uid() AND pa.id = colheitas.parcela_id
    )
  );

CREATE POLICY "Users can manage related colheitas"
  ON public.colheitas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parcelas pa
      JOIN public.exploracoes e ON e.id = pa.exploracao_id
      JOIN public.profiles p ON p.entidade_id = e.produtor_id
      WHERE p.id = auth.uid() AND pa.id = colheitas.parcela_id
    )
  );

-- RLS Policies for lotes (public read for verification)
CREATE POLICY "Public can view approved lotes"
  ON public.lotes FOR SELECT
  USING (estado = 'aprovado' OR estado = 'exportado');

CREATE POLICY "Authenticated users can view all lotes"
  ON public.lotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create lotes"
  ON public.lotes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins and technicians can update lotes"
  ON public.lotes FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin_inca') OR
    public.has_role(auth.uid(), 'tecnico_inca')
  );

-- RLS Policies for secagens
CREATE POLICY "Users can view related secagens"
  ON public.secagens FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create secagens"
  ON public.secagens FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_entities
  BEFORE UPDATE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_exploracoes
  BEFORE UPDATE ON public.exploracoes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_parcelas
  BEFORE UPDATE ON public.parcelas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_colheitas
  BEFORE UPDATE ON public.colheitas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_lotes
  BEFORE UPDATE ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_secagens
  BEFORE UPDATE ON public.secagens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique lot reference
CREATE OR REPLACE FUNCTION public.generate_lot_reference()
RETURNS TEXT AS $$
DECLARE
  new_ref TEXT;
  ref_exists BOOLEAN;
BEGIN
  LOOP
    new_ref := 'LOT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.lotes WHERE referencia_lote = new_ref) INTO ref_exists;
    EXIT WHEN NOT ref_exists;
  END LOOP;
  RETURN new_ref;
END;
$$ LANGUAGE plpgsql;

-- Function to generate QR code text
CREATE OR REPLACE FUNCTION public.generate_qr_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QR-' || LPAD(FLOOR(RANDOM() * 9999999999)::TEXT, 10, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate lot reference and QR on insert
CREATE OR REPLACE FUNCTION public.auto_generate_lot_codes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referencia_lote IS NULL THEN
    NEW.referencia_lote := public.generate_lot_reference();
  END IF;
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := public.generate_qr_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_lot_codes
  BEFORE INSERT ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_lot_codes();