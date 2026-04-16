ALTER TABLE public.audit_logs ALTER COLUMN user_id DROP NOT NULL;

-- Also update the existing TEMP-BLEND lot reference
UPDATE lotes 
SET referencia_lote = 'LOT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0') 
WHERE referencia_lote LIKE 'TEMP-BLEND%';

-- Fix the auto_generate_lot_codes trigger to work on BEFORE INSERT
-- so blends get proper references automatically
CREATE OR REPLACE FUNCTION public.auto_generate_lot_codes()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.referencia_lote IS NULL OR NEW.referencia_lote LIKE 'PLACEHOLDER-%' THEN
    NEW.referencia_lote := public.generate_lot_reference();
  END IF;
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := public.generate_qr_code();
  END IF;
  RETURN NEW;
END;
$function$;