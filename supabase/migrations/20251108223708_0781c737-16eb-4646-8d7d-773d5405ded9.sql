-- Create IoT sensors table
CREATE TABLE IF NOT EXISTS public.iot_sensors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT,
  parcela_id UUID REFERENCES public.parcelas(id),
  status TEXT NOT NULL DEFAULT 'active',
  last_reading_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view sensors" ON public.iot_sensors;
CREATE POLICY "Everyone can view sensors"
ON public.iot_sensors FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage sensors" ON public.iot_sensors;
CREATE POLICY "Admins can manage sensors"
ON public.iot_sensors FOR ALL
USING (
  public.has_role(auth.uid(), 'admin_inca'::app_role) OR
  public.has_role(auth.uid(), 'tecnico_inca'::app_role)
);

-- Create sensor readings table
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
  value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view sensor readings" ON public.sensor_readings;
CREATE POLICY "Everyone can view sensor readings"
ON public.sensor_readings FOR SELECT
USING (true);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON public.sensor_readings(timestamp DESC);

-- Create harvests table
CREATE TABLE IF NOT EXISTS public.harvests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parcela_id UUID NOT NULL REFERENCES public.parcelas(id),
  harvest_date DATE NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  quality_score DECIMAL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view harvests" ON public.harvests;
CREATE POLICY "Everyone can view harvests"
ON public.harvests FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create harvests" ON public.harvests;
CREATE POLICY "Authenticated users can create harvests"
ON public.harvests FOR INSERT
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own harvests" ON public.harvests;
CREATE POLICY "Users can update their own harvests"
ON public.harvests FOR UPDATE
USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_harvests_parcela_id ON public.harvests(parcela_id);
CREATE INDEX IF NOT EXISTS idx_harvests_harvest_date ON public.harvests(harvest_date DESC);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID NOT NULL,
  user_email TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin_inca'::app_role) OR
  public.has_role(auth.uid(), 'tecnico_inca'::app_role)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- Create function to log changes
CREATE OR REPLACE FUNCTION public.log_audit_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    user_id,
    user_email
  )
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid())
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to important tables
DROP TRIGGER IF EXISTS audit_lotes_changes ON public.lotes;
CREATE TRIGGER audit_lotes_changes
AFTER INSERT OR UPDATE OR DELETE ON public.lotes
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS audit_parcelas_changes ON public.parcelas;
CREATE TRIGGER audit_parcelas_changes
AFTER INSERT OR UPDATE OR DELETE ON public.parcelas
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

DROP TRIGGER IF EXISTS audit_harvests_changes ON public.harvests;
CREATE TRIGGER audit_harvests_changes
AFTER INSERT OR UPDATE OR DELETE ON public.harvests
FOR EACH ROW EXECUTE FUNCTION public.log_audit_change();

-- Create trigger for harvest timestamps using existing function
DROP TRIGGER IF EXISTS update_harvests_updated_at ON public.harvests;
CREATE TRIGGER update_harvests_updated_at
BEFORE UPDATE ON public.harvests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for sensor timestamps using existing function
DROP TRIGGER IF EXISTS update_iot_sensors_updated_at ON public.iot_sensors;
CREATE TRIGGER update_iot_sensors_updated_at
BEFORE UPDATE ON public.iot_sensors
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();